import Layout from "@/components/layout"
import QuestionListItem from "@/components/question-list-item"


export default function AllQuestions({ questions }) {

  if ( questions.error && questions.error.name) {
    return <div>Error</div>
  }
  

  return (
    <Layout>
      <div className="container">
        { questions && questions.map((link, idx) => (
          <QuestionListItem
            key={link.id}
            question={link}
            id={idx + 1}
            onClick={() => console.log('remove click')}
          />
        ))}
      </div>
    </Layout>
  
  )
}
 
// This function gets called at build time
export async function getStaticProps() {
  // Call an external API endpoint to get posts
  const res = await fetch('https://kruze-ai-agent.vercel.app/api/questions/all')
  const questions = await res.json()
 
  // By returning { props: { posts } }, the Blog component
  // will receive `posts` as a prop at build time

  return {
    props: {
      questions
    },
  }
}