import db from '../../../db'

const getQaById = async (req, res) => {
  const {
    query: { id },
  } = req
  try {
    const result = await db.query('SELECT * FROM qas WHERE id = $1', [id])
    res.status(200).json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error })
  }
}

const deleteQaById = async (req, res) => {
  const {
    query: { id },
  } = req
  try {
    const result = await db.query('DELETE FROM qas WHERE id = $1', [id])
    res.status(200).json(result)
  } catch (error) {
    res.status(500).json({ error })
  }
}

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return getQaById(req, res)
    case 'DELETE':
      return deleteQaById(req, res)
    default:
      res.status(405).end()
  }
}
