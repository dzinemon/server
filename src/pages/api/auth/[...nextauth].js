import NextAuth from 'next-auth'
// import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

import db from '../../../db'
import bcrypt from 'bcrypt'

// Environment Variables Validation
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error(
    'Missing required Google OAuth environment variables: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET'
  )
}

const getUserByEmail = async (email) => {
  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [
      email,
    ])
    return result.rows[0]
  } catch (error) {
    console.log('error', error)
    return null // Return null instead of error message
  }
}

// Remove top-level await - generate salt when needed
const saltRounds = 10

/* create users table */

// CREATE TABLE users (
//   id SERIAL PRIMARY KEY,
//   name VARCHAR(255),
//   email VARCHAR(255) UNIQUE,
//   role VARCHAR(255),
//   password VARCHAR(255),
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    // CredentialsProvider({
    //   // The name to display on the sign in form (e.g. 'Sign in with...')
    //   name: 'Credentials',
    //   // The credentials is used to generate a suitable form on the sign in page.
    //   // You can specify whatever fields you are expecting to be submitted.
    //   // e.g. domain, username, password, 2FA token, etc.
    //   // You can pass any HTML attribute to the <input> tag through the object.
    //   credentials: {
    //     username: { label: 'Username', type: 'text', placeholder: 'jsmith' },
    //     password: { label: 'Password', type: 'password' },
    //   },
    //   async authorize(credentials, req) {
    //     // You need to provide your own logic here that takes the credentials
    //     // submitted and returns either a object representing a user or value
    //     // that is false/null if the credentials are invalid.
    //     // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
    //     // You can also use the `req` object to obtain additional parameters
    //     // (i.e., the request IP address)

    //     const user = await getUserByEmail(credentials.username)

    //     // const hash = await bcrypt.hash(credentials.password, salt);
    //     // console.log('hash', hash)

    //     const match = await bcrypt
    //       .compare(credentials.password, user.password)
    //       .then((result) => result)

    //     console.log('match', match)

    //     // const res = await fetch("/your/endpoint", {
    //     //   method: 'POST',
    //     //   body: JSON.stringify(credentials),
    //     //   headers: { "Content-Type": "application/json" }
    //     // })
    //     // const user = await res.json()

    //     // const user = { id: "1", name: "J Smith", email: "jsmith@example.com" }

    //     // If no error and we have user data, return it
    //     if (match) {
    //       return user
    //     }
    //     // Return null if user data could not be retrieved
    //     return null
    //   },
    // }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // ...add more providers here
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Save user data to JWT token to reduce DB calls
      if (account && profile) {
        // Only fetch user data during initial sign-in
        const user = await getUserByEmail(profile.email)
        if (user) {
          token.role = user.role
          token.userId = user.id
          token.email = user.email
          token.name = user.name
        }
      }
      return token
    },
    async signIn({ account, profile }) {
      if (account.provider === 'google') {
        try {
          const email_verified = profile.email_verified
          const matchesDomain = profile.email.endsWith('@kruzeconsulting.com')

          if (email_verified && matchesDomain) {
            const existingUser = await getUserByEmail(profile.email)

            if (!existingUser) {
              await db.query(
                'INSERT INTO users (name, email, role, created_at, updated_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
                [profile.name, profile.email, 'user']
              )
              console.log('New user created:', profile.email)
            } else {
              // Update existing user's last login time
              await db.query(
                'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE email = $1',
                [profile.email]
              )
            }
            return true
          }
          console.log(
            'Sign in rejected - domain or email verification failed:',
            profile.email
          )
          return false // Reject unverified emails or wrong domain
        } catch (error) {
          console.error('Error during sign in process:', error)
          return false // Reject sign in if database operations fail
        }
      }
      return true // Do different verification for other providers that don't have `email_verified`
    },
    async session({ session, token }) {
      // Use data from JWT token instead of making DB calls every time
      if (token) {
        session.user.role = token.role
        session.user.id = token.userId

        // Only update activity timestamp occasionally to reduce DB load
        // We can do this less frequently since we're using JWT tokens
        const shouldUpdateActivity = Math.random() < 0.1 // 10% chance to update

        if (shouldUpdateActivity) {
          try {
            await db.query(
              'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE email = $1',
              [session.user.email]
            )
          } catch (error) {
            console.error('Error updating user activity timestamp:', error)
            // Don't fail the session if timestamp update fails
          }
        }
      }
      return session
    },
  },
  // cookies: {
  //   sessionToken: {
  //     name: `__Secure-next-auth.session-token`,
  //     options: {
  //       httpOnly: process.env.VERCEL_ENV === 'production',
  //       sameSite: 'None', // Change this to None
  //       secure: process.env.VERCEL_ENV === 'production', // Ensure this is true
  //       path: '/',
  //     },
  //   },
  //   callbackUrl: {
  //     name: `__Secure-next-auth.callback-url`,
  //     options: {
  //       sameSite: 'None', // Change this to None
  //       secure: process.env.VERCEL_ENV === 'production', // Ensure this is true
  //       path: '/',
  //     },
  //   },
  //   csrfToken: {
  //     name: `__Host-next-auth.csrf-token`,
  //     options: {
  //       httpOnly: process.env.VERCEL_ENV === 'production',
  //       sameSite: 'None', // Change this to None
  //       secure: process.env.VERCEL_ENV === 'production', // Ensure this is true
  //       path: '/',
  //     },
  //   },
  // },
  useSecureCookies: process.env.VERCEL_ENV === 'production',
}

export default NextAuth(authOptions)
