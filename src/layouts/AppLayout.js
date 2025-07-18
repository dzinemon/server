import SidebarLayout from '@/components/layout/SidebarLayout'
import { getContentSidebarConfig } from '@/components/layout/sidebarConfig'
import { useRouter } from 'next/router'

/**
 * Application layout that provides sidebar navigation
 * This is a wrapper around SidebarLayout that automatically
 * determines which sidebar configuration to use based on the current route
 */
export default function AppLayout({ children }) {
  const router = useRouter()
  let pageType = ''

  // Get the appropriate sidebar configuration
  const sidebarSections = getContentSidebarConfig(pageType)

  return (
    <SidebarLayout sidebarSections={sidebarSections}>{children}</SidebarLayout>
  )
}
