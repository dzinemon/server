import { 
  createChatCompletionCustom
 } from '../../../../utils/openai'

// import data from '../../../../data/data.json';

// import checkRequestOrigin from '../../../../utils/checkRequestOrigin'

const postUrl = async (req, res) => {
  const { 
    prompt, model, temperature, instructions } = req.body

  const completion = await createChatCompletionCustom(
    prompt, model, temperature, instructions
  )

  res.status(200).json({ completion })
}

export const config = {
  maxDuration: 30,
};

export default function handler(req, res) {
  switch (req.method) {
    case 'POST':
      return postUrl(req, res)
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
