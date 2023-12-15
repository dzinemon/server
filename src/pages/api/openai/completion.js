import { createChatCompletion } from '../../../../utils/openai'

// import data from '../../../../data/data.json';

// import checkRequestOrigin from '../../../../utils/checkRequestOrigin'

const postUrl = async (req, res) => {
  const { prompt } = req.body

  const completion = await createChatCompletion(prompt)

  res.status(200).json({ completion })
}

export default function handler(req, res) {
  switch (req.method) {
    case 'POST':
      return postUrl(req, res)
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
