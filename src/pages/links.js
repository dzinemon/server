import Layout from '../components/layout'
import { InformationCircleIcon } from '@heroicons/react/24/solid'
import Assistant from '@/components/assistant'

import LinksList from '@/components/link'

export default function Internal() {
  const title = 'Internal'
  const subtitle = ''
  return (
    <Layout>
      <LinksList />
    </Layout>
  )
}
