import { PineconeClient } from '@pinecone-database/pinecone'
// import generateEmbedding from './embed';
import { generateEmbedding } from './openai'

const client = new PineconeClient()

const config = {
  apiKey: process.env.INTERNAL_PINECONE_API_KEY,
  environment: process.env.PINECONE_ENVIRONMENT,
  index: process.env.INTERNAL_PINECONE_INDEX,
}

async function init() {
  return await client.init({
    apiKey: config.apiKey,
    environment: config.environment,
  })
}

// write function to loop through each document and return vectors used to upsert

async function generateVectors(docs) {
  try {
    const promises = await docs.map(async (doc, idx) => {
      const { content } = doc.metadata

      const embd = await generateEmbedding(content)

      const vector = {
        id: doc.metadata.id,
        values: embd,
        metadata: {
          content: content,
          id: doc.metadata.id,
          image: doc.metadata.image,
          source: doc.metadata.source,
          title: doc.metadata.title,
          type: doc.metadata.type,
          url: doc.metadata.url,
        },
      }

      return vector
    })
    const vectors = await Promise.all(promises)
    return vectors
  } catch (error) {
    console.error(error)
    throw error
  }
}

async function upsertEmbedding(docs) {
  try {
    await init()

    const index = client.Index(config.index)

    const vectors = await generateVectors(docs)

    const response = await index.upsert({
      upsertRequest: {
        vectors: vectors,
      },
    })

    return response
  } catch (error) {
    // Handle the error here
    console.error(error)
    throw error
  }
}

async function deleteAllVectors() {
  try {
    await init()

    const index = client.Index(config.index)

    const response = await index.delete1({
      deleteAll: true,
    })

    return response
  } catch (error) {
    console.error(error)
    throw error
  }
}

async function queryEmbedding(queryVector, filterValues) {
  try {
    await init()

    const index = client.Index(config.index)

    const queryRequest = {
      topK: 8,
      vector: queryVector,
      filter: { source: { $in: filterValues } },
      includeMetadata: true,
    }

    const response = await index.query({ queryRequest })
    // console.log('Query Response', response)
    return response
  } catch (error) {
    console.error(error)
    throw error
  }
}

async function deleteEmbedding(ids) {
  try {
    await init()

    const index = client.Index(config.index)

    const response = await index.delete1({
      ids: ids,
    })

    return response
  } catch (error) {
    console.error(error)
    throw error
  }
}

export { upsertEmbedding, deleteEmbedding, deleteAllVectors, queryEmbedding }
