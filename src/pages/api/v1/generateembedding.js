import { generateEmbedding } from '../../../../utils/openai'

const postUrl = async (req, res) => {
  try {
    const { question } = req.body
    const embedding = await generateEmbedding(question)
    res.status(200).json({ embedding })
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
