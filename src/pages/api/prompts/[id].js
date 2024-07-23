import db from '../../../db'

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req

  switch (method) {
    case 'GET':
      try {
        const result = await db.query('SELECT * FROM prompts WHERE id = $1', [id])
        res.status(200).json(result.rows[0])
      } catch (error) {
        res.status(500).json({ error })
      }
      break
    case 'PUT':
      try {
        const { name, content } = req.body
        const result = await db.query(
          'UPDATE prompts SET name = $1, content = $2 WHERE id = $3 RETURNING *',
          [name, content, id]
        )
        res.status(200).json(result.rows[0])
      } catch (error) {
        res.status(500).json({ error })
      }
      break
    case 'DELETE':
      try {
        const result = await db.query('DELETE FROM prompts WHERE id = $1', [id])
        res.status(200).json(result.rows[0])
      } catch (error) {
        res.status(500).json({ error })
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

