import { PineconeClient } from '@pinecone-database/pinecone'

const pineconeOptions = {
  environment: process.env.PINECONE_ENVIRONMENT,
  apiKey: process.env.PINECONE_API_KEY,
}

// use pinecone options to make a request and output list of indexes as json in response

const pinecone = new PineconeClient()

export default async function handler(req, res) {
  await pinecone.init(pineconeOptions)

  const indexes = await pinecone.listIndexes()

  res.status(200).json(indexes)
}
