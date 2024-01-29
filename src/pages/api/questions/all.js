// import db

import db from '../../../db'

// http://localhost:3000/api/questions


const getAllQa = async (req, res) => {
  // query database for all question only if request origin is from https://kruze-ai-agent.vercel.app/

  if (req.headers.origin !== 'https://kruze-ai-agent.vercel.app') {
    return res.status(401).json({ message: 'Unauthorized' })
  }


  const result = await db.query('SELECT * FROM qas')
  return res.status(200).json(result.rows)
}

export default async function handler(req, res) {

  switch (req.method) {
    case 'GET':
      await getAllQa(req, res)
      break
    default:
      res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
