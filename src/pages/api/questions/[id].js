import db from '../../../db'

// http://localhost:3000/api/questions/:id

export default async function qaById(req, res) {
  const {
    query: { id },
    method,
  } = req

  switch (method) {
    case 'GET':
      try {
        const result = await db.query('SELECT * FROM qas WHERE id = $1', [id])
        res.status(200).json(result.rows[0])
      } catch (error) {
        res.status(500).json({ error })
      }
      break
    case 'DELETE':
      try {
        const result = await db.query('DELETE FROM qas WHERE id = $1', [id])

        res.status(200).json(result)
      } catch (error) {
        res.status(500).json({ error })
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
