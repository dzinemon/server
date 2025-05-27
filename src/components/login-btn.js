import { useEffect } from 'react'

import { useSession, signIn, signOut } from 'next-auth/react'
import { Menu, Transition } from '@headlessui/react'
import Image from 'next/image'

import { useUser } from '@/context/user'

export default function Component() {
  const { data: session } = useSession()

  const { currentUser, setCurrentUser } = useUser()

  useEffect(() => {
    if (session) {
      setCurrentUser(session.user)
    }
  }, [session])

  if (session) {
    return (
      <>
        <Menu as="div" className="relative mx-3">
          <div>
            <Menu.Button className="relative flex rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
              <span className="absolute -inset-1.5" />
              <span className="sr-only">Open user menu</span>

              <div className="flex justify-start items-center space-x-2">
                <Image
                  className="h-8 w-8 rounded-full"
                  width={32}
                  height={32}
                  src={session.user.image}
                  alt=""
                />
                <div className="text-left leading-none">
                  <p className="text-sm">{session.user.name}</p>
                  {session.user.role === 'admin' && (
                    <p className="text-xs text-rose-500">{session.user.role}</p>
                  )}
                </div>
              </div>
            </Menu.Button>
          </div>
          <Transition
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute px-4 py-3 space-y-3 right-0 mt-2 w-auto origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <Menu.Item>
                <div className="text-sm">
                  Signed in as
                  <p className="text-xs text-slate-500">{session.user.email}</p>
                </div>
              </Menu.Item>

              <Menu.Item>
                <button
                  className="hover:text-rose-600 border border-slate-400 hover:border-rose-600 text-sm font-semibold rounded-lg text-slate-900 px-4 py-2 bg-slate-200"
                  onClick={() => signOut()}
                >
                  Sign out
                </button>
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>

        <button
          className="hover:text-rose-600 border border-slate-400 hover:border-rose-600 text-sm font-semibold rounded-lg text-slate-900 px-4 py-2 bg-slate-200"
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
        className="hover:text-rose-600 border border-slate-400 hover:border-rose-600 text-sm font-semibold rounded-lg text-slate-900 px-4 py-2 bg-slate-200"
        onClick={() => signIn()}
      >
        Sign in
      </button>
    </>
  )
}
