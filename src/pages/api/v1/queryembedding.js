import { queryEmbedding } from '../../../../utils/pinecone'

const postUrl = async (req, res) => {
  try {
    const { 
      embedding,
      filterValues,
      topK
    } = req.body

    const data = await queryEmbedding(
      embedding,
      filterValues,
      topK
    )

    // const sources = data.matches.map((match) => {
    //   return {
    //     id: match.metadata.id,
    //     title: match.metadata.title,
    //     type: match.metadata.type,
    //     image: match.metadata.image || '',
    //     source: match.metadata.source,
    //     url: match.metadata.url,
    //     score: match.score,
    //   }
    // }
    // )
    // .filter(
    //   (item, idx, arr) => arr.findIndex((t) => t.url === item.url) === idx
    // )

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

