// import db
import db from '../../../db'

// http://localhost:3000/api/questions


const getAllQa = async (req, res) => {

  // each qna has id , question, answer, resources; for now, we will only return the last 40 items with id and qestion

  const result = await db.query('SELECT id, question FROM qas ORDER BY id DESC')

  return res.status(200).json(result.rows)
}

const delArrayOfIds = async (req, res) => {
  const { ids } = req.body
  const result = await db.query('DELETE FROM qas WHERE id = ANY($1)', [ids])

  res.status(200).json(result)
}

export default async function handler(req, res) {

  switch (req.method) {
    case 'GET':
      await getAllQa(req, res)
      break
    case 'DELETE':
      // delete questions by id
      await delArrayOfIds(req, res)
      break
    default:
      res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
