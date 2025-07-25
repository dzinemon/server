// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import db from '../../../db'

import { deleteEmbedding } from '../../../../utils/pinecone'

export default async function urlById(req, res) {
  const {
    query: { id },
    method,
  } = req

  console.log('id', req.query)

  const array_uuids = JSON.parse(req.query.ids)

  switch (method) {
    case 'GET':
      try {
        const result = await db.query('SELECT * FROM links WHERE id = $1', [id])
        res.status(200).json(result.rows[0])
      } catch (error) {
        res.status(500).json({ error })
      }
      break

    case 'DELETE':
      try {
        const result = await db.query('DELETE FROM links WHERE id = $1', [id])

        if (result.rowCount === 0) {
          return res.status(404).json({ message: 'Item not found' })
        } else {
          console.log('ids', array_uuids)
          const pineconeResult = await deleteEmbedding(array_uuids)
          console.log('pinecone Delete Result', pineconeResult)
        }

        res.status(200).json(result.rows[0])
      } catch (error) {
        res.status(500).json({ error })
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
