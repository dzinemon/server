// import db
import db from '../../../db'

// http://localhost:3000/api/questions


const getAllQa = async (req, res) => {

  const result = await db.query('SELECT * FROM qas ORDER BY id DESC LIMIT 20')

  return res.status(200).json(result.rows)
}

export default async function handler(req, res) {

  switch (req.method) {
    case 'GET':
      await getAllQa(req, res)
      break
    default:
      res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
