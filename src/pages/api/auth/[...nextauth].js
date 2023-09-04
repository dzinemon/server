import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

import db from '../../../db'
import bcrypt from 'bcrypt'

const getUserByEmail = async (email) => {
  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [
      email,
    ])
    return result.rows[0]
  } catch (error) {
    console.log('error', error)
    return error.message
  }
}
const saltRounds = 10
const salt = await bcrypt.genSalt(saltRounds)

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: 'Credentials',
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'jsmith' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        // You need to provide your own logic here that takes the credentials
        // submitted and returns either a object representing a user or value
        // that is false/null if the credentials are invalid.
        // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
        // You can also use the `req` object to obtain additional parameters
        // (i.e., the request IP address)

        const user = await getUserByEmail(credentials.username)

        // const hash = await bcrypt.hash(credentials.password, salt);
        // console.log('hash', hash)

        const match = await bcrypt
          .compare(credentials.password, user.password)
          .then((result) => result)

        console.log('match', match)

        // const res = await fetch("/your/endpoint", {
        //   method: 'POST',
        //   body: JSON.stringify(credentials),
        //   headers: { "Content-Type": "application/json" }
        // })
        // const user = await res.json()

        // const user = { id: "1", name: "J Smith", email: "jsmith@example.com" }

        // If no error and we have user data, return it
        if (match) {
          return user
        }
        // Return null if user data could not be retrieved
        return null
      },
    }),
    // ...add more providers here
  ],
}

export default NextAuth(authOptions)
