import db from '../../../db'

const getMemberById = async (req, res) => {
  const { id } = req.query
  try {
    const result = await db.query(
      'SELECT id, name, content FROM members WHERE id = $1',
      [id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' })
    }
    res.status(200).json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error })
  }
}

const updateMemberById = async (req, res) => {
  const { id } = req.query
  const { name, content } = req.body
  try {
    const result = await db.query(
      'UPDATE members SET name = $1, content = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, name, content',
      [name, content, id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' })
    }
    res.status(200).json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error })
  }
}

const deleteMemberById = async (req, res) => {
  const { id } = req.query
  try {
    const result = await db.query(
      'DELETE FROM members WHERE id = $1 RETURNING id, name, content',
      [id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' })
    }
    res.status(200).json({ message: 'Member deleted successfully' })
  } catch (error) {
    res.status(500).json({ error })
  }
}

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return getMemberById(req, res)
    case 'PUT':
      return updateMemberById(req, res)
    case 'DELETE':
      return deleteMemberById(req, res)
    default:
      res.status(405).end()
  }
}
