import SidebarLayout from '@/components/layout/SidebarLayout'
import LinksList from '@/components/LinksList'

export default function Links() {
  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Links</h1>
        <p className="text-gray-500">
          Manage your links here. You can add, edit, or delete links that are
          stored in your Pinecone database.
        </p>
        <LinksList />
      </div>
    </SidebarLayout>
  )
}
