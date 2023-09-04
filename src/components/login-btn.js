import { useSession, signIn, signOut } from 'next-auth/react'

export default function Component() {
  const { data: session } = useSession()
  if (session) {
    return (
      <>
        <span className="text-sm leading-0">
          Signed in as {session.user.email}
        </span>
        <button
          className="hover:text-sky-600 text-sm font-semibold leading-6 text-gray-900 px-4"
          onClick={() => signOut()}
        >
          Sign out
        </button>
      </>
    )
  }
  return (
    <>
      Not signed in <br />
      <button
        className="hover:text-sky-600 text-sm font-semibold leading-6 text-gray-900 px-4"
        onClick={() => signIn()}
      >
        Sign in
      </button>
    </>
  )
}
