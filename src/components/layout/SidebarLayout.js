import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react'; // Added for auth check

import {
  LinkIcon,
  FileIcon,
  DocumentTextIcon,
  FolderArrowDownIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid'

export const sidebarSections = [
  {
    title: 'Content',
    defaultOpen: true,
    items: [
      {
        label: 'Links',
        href: '/links'
      },
      {
        label: 'Files (CSV)',
        href: '/files-csv'
      },
      {
        label: 'Files (PDF)',
        href: '/files-pdf'
      },
      {
        label: 'Texts',
        href: '/texts'
      }
    ]
  }
]

/**
 * Sidebar navigation item component
 */
const SidebarNavItem = ({ href, children, isActive }) => {
  return (
    <Link
      href={href}
      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md group ${
        isActive
          ? 'bg-kruze-blueDark bg-opacity-10 text-kruze-blueDark'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      
      {children}
    </Link>
  );
};

/**
 * Collapsible sidebar section component
 */
const SidebarSection = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="px-3 py-2">
      <button
        className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-600 hover:text-gray-900"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        <svg
          className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-90' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {isOpen && <div className="mt-2 space-y-1">{children}</div>}
    </div>
  );
};

/**
 * Sidebar layout component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Main content
 * @param {boolean} props.showSidebar - Whether to show the sidebar (for mobile)
 * @param {function} props.toggleSidebar - Function to toggle sidebar visibility
 * @param {Array} props.sidebarSections - Array of section objects with title and items
 */
export default function SidebarLayout({ children}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession(); // Use session

  // Always call hooks first
  useEffect(() => {
    const handleRouteChange = () => {
      setSidebarOpen(false);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  // Show loading or nothing while session is loading
  if (status === 'loading') {
    return null;
  }

  // If not logged in, show nothing (or you can redirect or show a message)
  if (!session) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        Not signed in <br />
        <button
          className="hover:bg-sky-700 text-sm font-semibold leading-6  text-gray-100 px-6 bg-sky-600 rounded-lg py-2 mx-5"
          onClick={() => import('next-auth/react').then(mod => mod.signIn())}
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex overflow-hidden bg-white">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-20 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 flex flex-col z-30 w-64 transition duration-300 transform bg-white border-r lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 bg-white border-b">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo-color.png"
              alt="Kruze Logo"
              width={20}
              height={20}
              className="w-auto h-6"
            />
            <span className="ml-2 text-lg font-semibold text-gray-800">Kruze</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {sidebarSections.map((section, idx) => (
            <SidebarSection key={`mobile-section-${idx}`} title={section.title} defaultOpen={section.defaultOpen}>
              {section.items.map((item, itemIdx) => (
                <SidebarNavItem
                  key={`mobile-item-${idx}-${itemIdx}`}
                  href={item.href}
                  isActive={router.pathname === item.href}
                >
                  {item.label}
                </SidebarNavItem>
              ))}
            </SidebarSection>
          ))}
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
          <div className="flex items-center h-16 px-6 bg-white border-b">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo-color.png"
                alt="Kruze Logo"
                width={20}
                height={20}
                className="w-auto h-6"
              />
              <span className="ml-2 text-lg font-semibold text-gray-800">Kruze</span>
            </Link>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <div className="px-4 py-4">
              {sidebarSections.map((section, idx) => (
                <SidebarSection key={`desktop-section-${idx}`} title={section.title} defaultOpen={section.defaultOpen}>
                  {section.items.map((item, itemIdx) => (
                    <SidebarNavItem
                      key={`desktop-item-${idx}-${itemIdx}`}
                      href={item.href} 
                      isActive={router.pathname === item.href}
                    >
                      {item.label}
                    </SidebarNavItem>
                  ))}
                </SidebarSection>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile top header with menu button */}
        <div className="lg:hidden border-b border-gray-200 bg-white fixed top-0 left-0 right-0 z-10">
          <div className="px-4 py-2 flex items-center justify-between">
            <button
              className="text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-kruze-blue"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div className="flex items-center">
              <Image
                src="/logo-color.png"
                alt="Kruze Logo"
                width={20}
                height={20}
                className="w-auto h-6"
              />
              <span className="ml-2 text-lg font-semibold text-gray-800">Kruze</span>
            </div>
            <div className="w-6"></div> {/* Empty div for centering */}
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-white p-4 pt-14 lg:pt-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
