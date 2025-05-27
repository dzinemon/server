import { generateEmbedding } from '../../../../utils/openai'

const postUrl = async (req, res) => {
  try {
    const { question } = req.body

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing question' })
    }

    const embedding = await generateEmbedding(question)
    res.status(200).json({ embedding })
  } catch (error) {
    console.error('Error generating embedding:', error)
    res
      .status(500)
      .json({ error: 'Failed to generate embedding', message: error.message })
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
