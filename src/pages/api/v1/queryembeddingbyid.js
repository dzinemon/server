import { queryEmbeddingById } from '../../../../utils/pinecone'

const postUrl = async (req, res) => {
  try {
    const {
      id,
      sourceFilters,
      typeFilters,
      topK,
      includeMetadata,
      includeValues,
    } = req.body

    const data = await queryEmbeddingById(
      id,
      sourceFilters,
      typeFilters,
      topK,
      includeMetadata,
      includeValues
    )

    res.status(200).json({ data })
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

export default function handler(req, res) {
  switch (req.method) {
    case 'POST':
      return postUrl(req, res)
    default:
      res.status(405).end()
  }
}
