import { generateEmbedding } from '../../../../utils/openai'
import { queryEmbedding } from '../../../../utils/pinecone'

import checkRequestOrigin from '../../../../utils/checkRequestOrigin'

import { promptTempateHD } from '../../../../utils/handleprompts/tempates'

const CONTEXT_LIMIT = 12000

const postUrl = async (req, res) => {
  const { question, sourceFilters, typeFilters, topK } = req.body

  try {
    const questionEmbedding = await generateEmbedding(question)

    const data = await queryEmbedding(
      questionEmbedding,
      sourceFilters,
      typeFilters,
      topK
    )

    if (!data.matches || data.matches.length === 0) {
      return res.status(200).json({
        prompt: 'No context found.',
        sources: [],
      })
    }

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
      })
      // filter unique sources by url
      .filter(
        (item, idx, arr) => arr.findIndex((t) => t.url === item.url) === idx
      )

    const sourcesWithContent = data.matches.map((match) => {
      return {
        id: match.metadata.id,
        title: match.metadata.title,
        type: match.metadata.type,
        source: match.metadata.source,
        url: match.metadata.url,
        score: match.score,
        content: match.metadata.content,
      }
    })

    // Build context efficiently while respecting the limit
    let contextLength = 0
    const contextChunks = []

    for (const match of data.matches) {
      const content = match.metadata.content
      if (contextLength + content.length <= CONTEXT_LIMIT) {
        contextChunks.push(content)
        contextLength += content.length
      } else {
        break
      }
    }

    const context = contextChunks.join('')

    if (context.length === 0) {
      return res.status(200).json({
        prompt: 'No context found.',
        sources: [],
      })
    }

    const prompt = promptTempateHD(question, sourcesWithContent, CONTEXT_LIMIT)

    res.status(200).json({
      prompt: prompt,
      sources: sources,
    })
  } catch (error) {
    console.error('Error processing embedding request:', error)
    res.status(500).json({ error: 'Failed to process your request' })
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
