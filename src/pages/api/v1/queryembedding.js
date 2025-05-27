import { queryEmbedding } from '../../../../utils/pinecone'

const postUrl = async (req, res) => {
  try {
    const {
      embedding,
      sourceFilters,
      typeFilters,
      topK,
      includeMetadata,
      includeValues,
    } = req.body

    // Validate input parameters
    if (!embedding || !Array.isArray(embedding)) {
      return res
        .status(400)
        .json({ error: 'Invalid or missing embedding array' })
    }

    const data = await queryEmbedding(
      embedding,
      sourceFilters,
      typeFilters,
      topK,
      includeMetadata,
      includeValues
    )

    res.status(200).json({ data })
  } catch (error) {
    console.error('Error querying embedding:', error)
    res
      .status(500)
      .json({ error: 'Failed to query embedding', message: error.message })
  }
}

export default function handler(req, res) {
  switch (req.method) {
    case 'POST':
      return postUrl(req, res)
    default:
      res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
