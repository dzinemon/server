// import db
import db from '../../../db'

// http://localhost:3000/api/questions


const getAllQa = async (req, res) => {

  // each qna has id , question, answer, resources; for now, we will only return the last 40 items with id and qestion

  const result = await db.query('SELECT id, question FROM qas ORDER BY id DESC LIMIT 40')

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
