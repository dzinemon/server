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

async function generateVectors(docs) {
  try {
    const vectors = await Promise.all(
      docs.map(async (doc) => {
        const { content } = doc.metadata
        const embd = await generateEmbedding(content)

        return {
          id: doc.metadata.id,
          values: embd,
          metadata: {
            content,
            id: doc.metadata.id,
            image: doc.metadata.image,
            source: doc.metadata.source,
            title: doc.metadata.title,
            type: doc.metadata.type,
            url: doc.metadata.url,
          },
        }
      })
    )
    return vectors
  } catch (error) {
    console.error('Error generating vectors:', error)
    throw error
  }
}

async function upsertEmbedding(docs) {
  try {
    const vectors = await generateVectors(docs)
    const response = await index.upsert(vectors)
    return response
  } catch (error) {
    console.error('Error upserting embeddings:', error)
    throw error
  }
}

async function deleteAllVectors() {
  try {
    const response = await index.delete1({ deleteAll: true })
    return response
  } catch (error) {
    console.error('Error deleting all vectors:', error)
    throw error
  }
}

async function queryEmbedding(
  queryVector,
  sourceFilters = ['website'],
  typeFilters,
  topK = 8,
  includeMetadata = true,
  includeValues = true
) {
  const currentFilter = () => {
    if (
      sourceFilters.length === 0 &&
      (!typeFilters || typeFilters.length === 0)
    ) {
      return {}
    } else if (sourceFilters?.length === 0 && typeFilters?.length !== 0) {
      return { type: { $in: typeFilters } }
    } else if (
      sourceFilters?.length !== 0 &&
      (!typeFilters || typeFilters.length === 0)
    ) {
      return { source: { $in: sourceFilters } }
    } else {
      return {
        $and: [
          { source: { $in: sourceFilters } },
          { type: { $in: typeFilters } },
        ],
      }
    }
  }

  const filterValue = currentFilter()

  try {
    const queryRequest = {
      topK,
      vector: queryVector,
      filter: filterValue,
      includeMetadata,
      includeValues,
    }

    const response = await index.query(queryRequest)
    return response
  } catch (error) {
    console.error('Error querying embeddings:', error)
    throw error
  }
}

async function queryEmbeddingById(
  id,
  sourceFilters = ['website'],
  typeFilters,
  topK = 8,
  includeMetadata = true,
  includeValues = true
) {
  try {
    const queryRequest = {
      topK,
      id,
      filter: {
        source: { $in: sourceFilters },
        type: { $in: typeFilters },
      },
      includeMetadata,
      includeValues,
    }

    const response = await index.query(queryRequest)
    return response
  } catch (error) {
    console.error('Error querying embedding by ID:', error)
    throw error
  }
}

async function deleteEmbedding(ids) {
  try {
    const response = await index.deleteMany(ids)
    return response
  } catch (error) {
    console.error('Error deleting embeddings:', error)
    throw error
  }
}

export {
  upsertEmbedding,
  deleteEmbedding,
  deleteAllVectors,
  queryEmbedding,
  queryEmbeddingById,
}
