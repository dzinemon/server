import db from '../../../db'

const getPromptById = async (req, res) => {
  const { id } = req.query
  try {
    const result = await db.query('SELECT * FROM prompts WHERE id = $1', [id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Prompt not found' })
    }
    res.status(200).json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error })
  }
}

const updatePromptById = async (req, res) => {
  const { id } = req.query
  const { name, content } = req.body
  try {
    const
    result = await db.query(
      'UPDATE prompts SET name = $1, content = $2 WHERE id = $3 RETURNING *',
      [name, content, id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Prompt not found' })
    }
    res.status(200).json(result.rows[0])
  }
  catch (error) {
    res.status(500).json({ error })
  }
}

const deletePromptById = async (req, res) => {

  const { id } = req.query
  try {
    const result = await db.query('DELETE FROM prompts WHERE id = $1 RETURNING *', [id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Prompt not found' })
    }
    res.status(200).json({ message: 'Prompt deleted successfully' })
  } catch (error) {
    res.status(500).json({ error })
  }

}


export default async function handler(req, res) {
  const {
    method
  } = req

  switch (method) {
    case 'GET':
      return getPromptById(req, res)
    case 'PUT':
      return updatePromptById(req, res)
    case 'DELETE':
      return deletePromptById(req, res)
    default:
      res.status(405).end()
  }
}

