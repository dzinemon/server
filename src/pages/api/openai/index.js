import {
  generateEmbedding,
  createChatCompletion,
} from '../../../../utils/openai'
import { queryEmbedding } from '../../../../utils/pinecone'

import checkRequestOrigin from '../../../../utils/checkRequestOrigin'

// import data from '../../../../data/data.json';

const postUrl = async (req, res) => {
  const { question } = req.body

  console.log(
    'Processing post request . . . to generateEmbedding . . .',
    question
  )

  const questionEmbedding = await generateEmbedding(question)

  const data = await queryEmbedding(questionEmbedding, ['website'])

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
  ) => `Answer the question based on the context below:
  
  Question: ${question}
  
  Context: ${context}
  `

  const thecontext = data.matches
    .map((match) => match.metadata.content)
    .join('\n')

  const completion = await createChatCompletion(
    promptTempate(question, thecontext)
  )

  console.log('completion', completion)
  console.log('the context', thecontext)
  console.log('the context length', thecontext.length)

  if (thecontext.length === 0) {
    res.status(200).json({
      answer: 'No context found.',
      sources: [],
    })
  } else {
    res.status(200).json({
      answer: completion,
      sources: sources,
    })
  }
}

export default function handler(req, res) {
  const originAllowed = checkRequestOrigin(req)

  if (!originAllowed) {
    res.status(403).end(`Origin ${req.headers.origin} is not allowed`)
    return
  }

  switch (req.method) {
    case 'POST':
      return postUrl(req, res)
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
