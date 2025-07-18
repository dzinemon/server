import SidebarLayout from '@/components/layout/SidebarLayout'
import CsvFileUploadComponent from '@/components/file-csv'

export default function Files() {
  // Define sidebar sections and navigation items

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          File Upload
        </h1>
        <p className="text-gray-500">
          Upload PDF files to your Pinecone database
        </p>
        <CsvFileUploadComponent />
      </div>
    </SidebarLayout>
  )
}
