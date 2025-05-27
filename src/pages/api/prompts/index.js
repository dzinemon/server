import db from '../../../db'

const getPrompts = async (req, res) => {
  const { type } = req.query

  try {
    let query = 'SELECT id, name, type FROM prompts'
    const params = []

    if (type) {
      query += ' WHERE type = $1'
      params.push(type)
    }

    query += ' ORDER BY id DESC'

    const result = await db.query(query, params)
    res.status(200).json(result.rows)
  } catch (error) {
    console.error('Error fetching prompts:', error)
    res.status(500).json({ error: 'Failed to fetch prompts' })
  }
}

const createPrompt = async (req, res) => {
  const { name, content, type } = req.body

  if (!name || !content) {
    return res.status(400).json({ error: 'Name and content are required' })
  }

  try {
    const result = await db.query(
      'INSERT INTO prompts (name, content, type) VALUES ($1, $2, $3) RETURNING *',
      [name, content, type]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error creating prompt:', error)
    res.status(500).json({ error: 'Failed to create prompt' })
  }
}

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return getPrompts(req, res)
    case 'POST':
      return createPrompt(req, res)
    default:
      res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
