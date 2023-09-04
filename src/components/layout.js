import Navbar from './navbar'
// import Footer from './footer'
import { Inter } from 'next/font/google'
import { useSession, signIn, signOut } from 'next-auth/react'

const inter = Inter({ subsets: ['latin'] })

export default function Layout({ children }) {
  const { data: session } = useSession()

  if (session) {
    return (
      <>
        <Navbar />
        <main className={`${inter.className}  min-h-screen bg-white/60`}>
          {children}
        </main>
        {/* <Footer /> */}
      </>
    )
  }

  return (
    <div className="h-screen w-full flex items-center justify-center">
      Not signed in <br />
      <button
        className="hover:bg-sky-700 text-sm font-semibold leading-6  text-gray-100 px-6 bg-sky-600 rounded-lg py-2 mx-5"
        onClick={() => signIn()}
      >
        Sign in
      </button>
    </div>
  )
}
