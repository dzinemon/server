import SidebarLayout from '@/components/layout/SidebarLayout'
import PdfFileUploadComponent from '@/components/file-pdf'

export default function Files() {
  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          File Upload
        </h1>
        <p className="text-gray-500">
          Upload PDF files to your Pinecone database
        </p>
        <PdfFileUploadComponent />
      </div>
    </SidebarLayout>
  )
}
