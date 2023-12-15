import {
  generateEmbedding,
  createChatCompletion,
} from '../../../../utils/openai'
import { queryEmbedding } from '../../../../utils/pinecone-internal'

import checkRequestOrigin from '../../../../utils/checkRequestOrigin'

// import data from '../../../../data/data.json';

const postUrl = async (req, res) => {
  const { question, subQuestions } = req.body

  // console.log(
  //   'Processing post request . . . to generateEmbedding . . .',
  //   question
  // )

  const questionEmbedding = await generateEmbedding(question)

  const data = await queryEmbedding(questionEmbedding)

  // get sources array of data

  const sources = data.matches
    .map((match) => {
      return {
        id: match.metadata.id,
        title: match.metadata.title,
        type: match.metadata.type,
        image: match.metadata.image || '',
        source: match.metadata.source,
        url: match.metadata.url,
        score: match.score,
      }
    }) // filter unique sources by url
    .filter(
      (item, idx, arr) => arr.findIndex((t) => t.url === item.url) === idx
    )

  // bundle prompt using data metadata content from all matches

  const promptTempate = (question, context, subQuestions = []) => {
    if (subQuestions.length === 0) {
      return `Answer the question based on the context below and format the answer with HTML tags:
  
      Question: ${question}
      
      Context: ${context}
      `
    } else {
      return `Answer the main question based on the context below, keep your reply to the previous quesitons and format the answer with HTML tags:
  
      Main Question: ${question}

      Previous quesitons: ${subQuestions.join(', ')}
      
      Context: ${context}
      `
    }
  }

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

  const prompt = promptTempate(question, thecontext, subQuestions)

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
