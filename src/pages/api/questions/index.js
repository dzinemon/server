// import db

import db from '../../../db'

const getAllQa = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, question FROM qas ORDER BY id DESC LIMIT 40'
    )
    res.status(200).json(result.rows)
  } catch (error) {
    return res.status(500).json({ error })
  }
}

const createQuestion = async (req, res) => {
  const { question, answer, resources } = req.body

  if (!question || !answer) {
    return res.status(400).json({ error: 'Question and answer are required' })
  }

  try {
    const result = await db.query(
      'INSERT INTO qas (question, answer, resources) VALUES ($1, $2, $3) RETURNING *',
      [question, answer, resources]
    )
    return res.status(201).json(result.rows[0])
  } catch (error) {
    return res.status(500).json({ error })
  }
}

// 'INSERT INTO qas (question, answer, resources) VALUES ($1, $2, $3) RETURNING *'

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      await getAllQa(req, res)
      break
    case 'POST':
      await createQuestion(req, res)
      break
    default:
      res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
