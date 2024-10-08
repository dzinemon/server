import { Pinecone } from '@pinecone-database/pinecone'
import { generateEmbedding } from './openai'

const config = {
  apiKey: process.env.PINECONE_API_KEY,
  index: process.env.PINECONE_INDEX,
}

const client = new Pinecone({
  apiKey: config.apiKey,
})

const index = client.index(config.index)

// const indexes = await client.listIndexes()

// console.log(indexes)

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
    // const index = client.index(config.index)
    const vectors = await generateVectors(docs)
    
    const response = await index.upsert(vectors)

    return response
  } catch (error) {
    // Handle the error here
    console.error(error)
    throw error
  }
}

async function deleteAllVectors() {
  try {
    // const index = client.index(config.index)
    const response = await index.delete1({
      deleteAll: true,
    })

    return response
  } catch (error) {
    console.error(error)
    throw error
  }
}

async function queryEmbedding(queryVector, filterValues, topK = 8) {
  try {
    // const index = client.index(config.index)
    const queryRequest = {
      topK: topK,
      vector: queryVector,
      filter: { source: { $in: filterValues } },
      includeMetadata: true,
    }

    const response = await index.query(queryRequest)

    return response
  } catch (error) {
    console.error(error)
    throw error
  }
}

async function deleteEmbedding(ids) {
  try {
    // const index = client.index(config.index)
    const response = await index.deleteMany(ids)

    return response
  } catch (error) {
    console.error(error)
    throw error
  }
}

export { upsertEmbedding, deleteEmbedding, deleteAllVectors, queryEmbedding }
