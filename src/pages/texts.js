import SidebarLayout from '@/components/layout/SidebarLayout'
import TextsList from '@/components/text'

export default function Texts() {
  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Texts</h1>
        <TextsList />
      </div>
    </SidebarLayout>
  )
}
