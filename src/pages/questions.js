import Layout from '../components/layout'

import QuestionsList from '@/components/questions'

export default function Internal() {
  const title = 'Internal'
  const subtitle = ''
  return (
    <Layout>
      <QuestionsList />
    </Layout>
  )
}
