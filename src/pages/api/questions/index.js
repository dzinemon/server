// import db

import db from '../../../db'

// http://localhost:3000/api/questions

const getAllQa = async (req, res) => {
  const result = await db.query('SELECT * FROM qas')
  res.status(200).json(result.rows)
}

const addQa = async (req, res) => {
  const { question, answer, resources } = req.body

  const result = await db.query(
    'INSERT INTO qas (question, answer, resources) VALUES ($1, $2, $3) RETURNING *',
    [question, answer, resources]
  )

  res.status(200).json(result.rows)
}

const deleteQa = async (req, res) => {
  const { id } = req.body
  const result = await db.query('DELETE FROM qas WHERE id = $1 RETURNING *', [
    id,
  ])
  res.status(200).json(result.rows)
}

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      await getAllQa(req, res)
      break
    case 'POST':
      await addQa(req, res)
      break

    case 'DELETE':
      await deleteQa(req, res)
      break

    default:
      res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
