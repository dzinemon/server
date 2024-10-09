import {
  generateEmbedding,
} from '../../../../utils/openai'
import { queryEmbedding } from '../../../../utils/pinecone'

import checkRequestOrigin from '../../../../utils/checkRequestOrigin'

const postUrl = async (req, res) => {
  const { question, 
    sourceFilters,
    typeFilters,
    topK,
   } = req.body
  
  const questionEmbedding = await generateEmbedding(question);

  const data = await queryEmbedding(
    questionEmbedding, 
    sourceFilters,
    typeFilters,
    topK
  );
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

  // console.log('sources ', sources.length)
  // bundle prompt using data metadata content from all matches

  const promptTempate = (question, context) => {
    return `Answer the question based on the context below provide answer in Rich Text Format, use headings and bullet points if necessary:
  
      Question: ${question}
      
      Context: ${context}
      `
  }

  // const thecontext = data.matches
  //   .map((match) => match.metadata.content)
  //   .join('\n')

  let limit = 12000

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
