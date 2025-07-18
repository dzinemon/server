import Navbar from './navbar'
// import Footer from './footer'
import { useSession } from 'next-auth/react'
import { Inter } from 'next/font/google'
import Loading from './Loading'

const inter = Inter({ subsets: ['latin'] })

export default function Layout({ children, hasNavar = true }) {
  const { data: session } = useSession()

  if (session === undefined) {
    return <Loading />
  }

  if (session) {
    return (
      <>
        {hasNavar && <Navbar />}
        <main className={`${inter.className} ${ hasNavar && "pt-14 lg:pt-16"}  min-h-screen bg-white/60`}>
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
        onClick={() => import('next-auth/react').then((mod) => mod.signIn())}
      >
        Sign in
      </button>
    </div>
  )
}
