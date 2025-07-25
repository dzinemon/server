import db from '../../../db'

const getMembers = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM members')
    res.status(200).json(result.rows)
  } catch (error) {
    res.status(500).json({ error })
  }
}

const createMember = async (req, res) => {
  const { name, content } = req.body
  if (!name || !content) {
    res.status(400).json({ error: 'Name and content are required' })
    return
  }

  try {
    const result = await db.query(
      'INSERT INTO members (name, content, created_at, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *',
      [name, content]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error })
  }
}

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return getMembers(req, res)
    case 'POST':
      return createMember(req, res)
    default:
      res.status(405).json({ error: 'Method not allowed' })
  }
}
