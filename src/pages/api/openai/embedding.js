import {
  generateEmbedding,
  createChatCompletion,
} from '../../../../utils/openai'
import { queryEmbedding } from '../../../../utils/pinecone-internal'

// import data from '../../../../data/data.json';

const postUrl = async (req, res) => {
  const { question } = req.body

  console.log(
    'Processing post request . . . to generateEmbedding . . .',
    question
  )

  const questionEmbedding = await generateEmbedding(question)

  const data = await queryEmbedding(questionEmbedding)

  // get sources array of data

  const sources = data.matches.map((match) => {
    return {
      id: match.metadata.id,
      title: match.metadata.title,
      url: match.metadata.url,
      score: match.score,
    }
  })

  // bundle prompt using data metadata content from all matches

  const promptTempate = (
    question,
    context
  ) => `Answer the question based on the context below and format the answer with HTML tags:
  
  Question: ${question}
  
  Context: ${context}
  `

  // const thecontext = data.matches
  //   .map((match) => match.metadata.content)
  //   .join('\n')

  let limit = 8000

  const thecontext = data.matches // check maximum length of context allowed by OpenAI
    .map((match) => match.metadata.content)
    .reduce((acc, curr) => {
      if (acc.length + curr.length < limit) {
        return acc + curr
      } else {
        return acc
      }
    }, '')

  const prompt = promptTempate(question, thecontext)

  if (thecontext.length === 0) {
    res.status(200).json({
      prompt: 'No context found.',
      sources: [],
    })
  } else {
    res.status(200).json({
      prompt: prompt,
      sources: sources,
    })
  }
}

export default function handler(req, res) {
  switch (req.method) {
    case 'POST':
      return postUrl(req, res)
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
