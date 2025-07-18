import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import LoginComponent from './login-btn'
import { useRouter } from 'next/router'
import { useUser } from '@/context/user'
import {
  NavDropdown,
  MobileNavSection,
  useNavDropdowns,
} from './navigation/nav-components'

export default function Navbar() {
  // Main mobile menu state
  const [isOpen, setIsOpen] = useState(false)

  // Use our custom hook to manage dropdown states - ensures only one dropdown is open at a time
  const {
    isOpen: isDropdownOpen,
    toggleDropdown,
    closeDropdown,
  } = useNavDropdowns(['upload', 'quotes'])

  const { pathname } = useRouter()

  // const { data: session } = useSession()

  const { currentUser } = useUser()

  const uploadItems = [
    {
      name: 'Upload Links',
      slug: 'links',
    },
    {
      name: 'Upload Files',
      slug: 'files',
    },
    {
      name: 'Upload Text',
      slug: 'texts',
    },
  ]

  // deprecated items
  // const quotesItems = [
  //   {
  //     name: 'Quotes by Topic',
  //     slug: 'podcast-quotes-topic',
  //   },
  //   {
  //     name: 'Podcast Quotes',
  //     slug: 'podcast-quotes',
  //   },
  //   {
  //     name: 'Podcast Quotes v2',
  //     slug: 'podcast-quotes-v2',
  //   },
  //   {
  //     name: 'Categories Quotes',
  //     slug: 'categories-quotes',
  //   },
  // ]

  const adminNavItems = [
    // {
    //   name: 'Links',
    //   slug: 'links',
    // },
    // {
    //   name: 'Files',
    //   slug: 'files',
    // },
    // {
    //   name: 'Text',
    //   slug: 'texts',
    // },
  ]

  const navItems = [
    // Quotes moved to dropdown
    // {
    //   name: 'External QA',
    //   slug: 'widget',
    // },
    {
      name: 'All Questions',
      slug: 'all-questions',
    },
    {
      name: 'Internal QA',
      slug: 'internal-qa',
    },
    {
      name: 'Internal Chat',
      slug: 'threaded-widget',
    },
    // {
    //   name: 'Generate Content',
    //   slug: 'generate',
    // },
    {
      name: '🤖 Li Post',
      slug: 'li-post-stream',
    },
  ]

  // We'll keep these items separate for admin access control
  if (currentUser?.role === 'admin') {
    navItems.push(...adminNavItems)
  }

  return (
    <header className="fixed backdrop-blur-lg top-0 w-full z-50">
      <nav
        className="mx-auto flex w-full max-w-[1500px] items-center justify-between p-4 lg:py-3 lg:px-6"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          <Link href="/" className="flex items-center justify-between">
            <span className="sr-only">Kruze</span>
            <Image
              src="/logo-color.png"
              alt="Kruze COnsulting Logo"
              className="dark:invert"
              width={15}
              height={18}
              priority
            />
            <span className="font-semibold">
              Kruze
              <span className="mx-1 bg-gradient-to-r from-sky-600 via-sky-500 to-sky-600 inline-block text-transparent bg-clip-text">
                AI Agent
              </span>
            </span>
          </Link>
        </div>

        <div className="hidden lg:flex lg:gap-x-12">
          {/* Quotes Dropdown - Available for all users */}
          {/* <NavDropdown
            label="Quotes"
            items={quotesItems}
            isOpen={isDropdownOpen('quotes')}
            toggleDropdown={() => toggleDropdown('quotes')}
            pathname={pathname}
            closeDropdown={() => closeDropdown('quotes')}
            id="quotes"
          /> */}

          {navItems.map((item, idx) => {
            return (
              <Link
                key={`nav-bar-lg-${idx}`}
                href={`/${item.slug}`}
                className={`${
                  pathname === `/${item.slug}`
                    ? 'underline pointer-events-none text-kruze-blueDark'
                    : 'text-kruze-dark'
                } hover:text-kruze-blueLight  text-sm font-semibold leading-6 text-gray-900`}
              >
                {item.name}
              </Link>
            )
          })}

          {/* Upload Dropdown - Only visible for admin users */}
          {currentUser?.role === 'admin' && (
            <NavDropdown
              label="Upload"
              items={uploadItems}
              isOpen={isDropdownOpen('upload')}
              toggleDropdown={() => toggleDropdown('upload')}
              pathname={pathname}
              closeDropdown={() => closeDropdown('upload')}
              id="upload"
            />
          )}
        </div>
        <div className={`lg:flex lg:flex-1 lg:justify-end hidden items-center`}>
          <LoginComponent />
        </div>
        <div className="flex lg:hidden">
          <button
            onClick={() => setIsOpen(true)}
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>
      </nav>

      <div
        className={`${
          isOpen ? 'block h-screen lg:h-auto' : 'hidden'
        } lg:hidden`}
        role="dialog"
        aria-modal="true"
      >
        <div className="fixed inset-0 z-10"></div>
        <div className="fixed inset-y-0 right-0 z-30 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">Kruze</span>
              <Image
                src="/logo-color.png"
                alt="Kruze Consulting Logo"
                className="dark:invert"
                width={15}
                height={18}
                priority
              />
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Close menu</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {/* Quotes Section in Mobile Menu */}
                {/* <MobileNavSection
                  title="Quotes"
                  items={quotesItems}
                  pathname={pathname}
                  onItemClick={() => setIsOpen(false)}
                /> */}

                {navItems.map((item, idx) => {
                  return (
                    <Link
                      key={`nav-bar-lg-${idx}`}
                      href={`/${item.slug}`}
                      className={`${
                        pathname.indexOf(item.slug) !== -1
                          ? 'underline pointer-events-none'
                          : ''
                      } -mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50`}
                    >
                      {item.name}
                    </Link>
                  )
                })}

                {/* Upload Section in Mobile Menu - Only visible for admin users */}
                {currentUser?.role === 'admin' && (
                  <MobileNavSection
                    title="Upload Options"
                    items={uploadItems}
                    pathname={pathname}
                    onItemClick={() => setIsOpen(false)}
                  />
                )}
              </div>
              <div className="py-6">
                <LoginComponent />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
