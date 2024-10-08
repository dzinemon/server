import db from '../../../db'

const getPrompts = async (req, res) => {
  const { type } = req.query

  // if type is provided, filter by type

  if (type) {
    try {
      // select only id and name from prompts table
      const result = await db.query(
        'SELECT id, name, type FROM prompts WHERE type = $1 ORDER BY id DESC',
        [type]
      )

      res.status(200).json(result.rows)
    } catch (error) {
      res.status(500).json({ error })
    }
    return
  } else {
    try {
      // select only id and name from prompts table
      const result = await db.query(
        'SELECT id, name, type FROM prompts ORDER BY id DESC'
      )

      res.status(200).json(result.rows)
    } catch (error) {
      res.status(500).json({ error })
    }
  }
}

const createPrompt = async (req, res) => {
  // INSERT INTO prompts (name, content) VALUES ('Test Prompt', 'This is a test prompt content.');

  const { name, content, type } = req.body

  if (!name || !content) {
    res.status(400).json({ error: 'Name and content are required' })
    return
  }

  try {
    const result = await db.query(
      'INSERT INTO prompts (name, content, type) VALUES ($1, $2, $3) RETURNING *',
      [name, content, type]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error })
  }
}

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return getPrompts(req, res)
    case 'POST':
      return createPrompt(req, res)

    default:
      res.status(405).end()
  }
}
