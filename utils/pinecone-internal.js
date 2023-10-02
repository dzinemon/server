import { PineconeClient } from '@pinecone-database/pinecone'
// import generateEmbedding from './embed';
import { generateEmbedding } from './openai'

const client = new PineconeClient()

async function init() {
  return await client.init({
    apiKey: process.env.INTERNAL_PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT,
  })
}

// write function to loop through each document and return vectors used to upsert

async function generateVectors(docs) {
  const promises = await docs.map(async (doc, idx) => {
    const { content } = doc.metadata

    const embd = await generateEmbedding(content)

    const vector = {
      id: doc.metadata.id,
      values: embd,
      metadata: {
        id: doc.metadata.id,
        url: doc.metadata.url,
        content: content,
        title: doc.metadata.title,
      },
    }

    return vector
  })
  const vectors = await Promise.all(promises)
  return vectors
}

async function upsertEmbedding(docs) {
  await init()

  const index = client.Index(process.env.INTERNAL_PINECONE_INDEX)

  // console.log('delete all started')
  // await index.delete1({
  //   deleteAll: true,
  // });
  // console.log('delete all ended')

  const vectors = await generateVectors(docs)

  const response = await index.upsert({
    upsertRequest: {
      vectors: vectors,
      // namespace: 'example-namespace'
    },
  })

  return response
}

async function deleteAllVectors() {
  await init()

  const index = client.Index(process.env.INTERNAL_PINECONE_INDEX)

  const response = await index.delete1({
    deleteAll: true,
  })

  return response
}

async function queryEmbedding(queryVector) {
  await init()
  // console.log('queryVector', queryVector)

  const index = client.Index(process.env.INTERNAL_PINECONE_INDEX)

  const queryRequest = {
    topK: 8,
    vector: queryVector,
    filter: { source: { $in: ['website'] } },
    includeMetadata: true,
  }

  const response = await index.query({ queryRequest })

  return response
}

async function deleteEmbedding(ids) {
  await init()

  const index = client.Index(process.env.INTERNAL_PINECONE_INDEX)

  const response = await index.delete1({
    ids: ids,
  })
  // console.log('deleted vectors response - ', response)

  return response
}

export { upsertEmbedding, deleteEmbedding, deleteAllVectors, queryEmbedding }
