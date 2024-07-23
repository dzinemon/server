import db from '../../../db'


const getPrompts = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM prompts')
    res.status(200).json(result.rows)
  } catch (error) {
    res.status(500).json({ error })
  }
}

const postPrompt = async (req, res) => {
  // INSERT INTO prompts (name, content) VALUES ('Test Prompt', 'This is a test prompt content.');

  const { name, content } = req.body

  const result = await db.query(
    'INSERT INTO prompts (name, content) VALUES ($1, $2) RETURNING *',
    [name, content]
  )
  res.status(200).json(result.rows)
}




export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return getPrompts(req, res)
    case 'POST':
      return postPrompt(req, res)

    default:
      res.status(405).end()
  }
}