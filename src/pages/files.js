import Layout from '../components/layout'
import { InformationCircleIcon } from '@heroicons/react/24/solid'
import Assistant from '@/components/assistant'

import FileUploadComponent from '@/components/file'

export default function Internal() {
  const title = 'File Upload'
  const subtitle = 'Upload PDF file'
  return (
    <Layout>
      <FileUploadComponent />
    </Layout>
  )
}
