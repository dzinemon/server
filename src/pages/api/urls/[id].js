// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import db from '../../../db'

import { deleteEmbedding } from '../../../../utils/pinecone'

export default async function urlById(req, res) {
  const {
    query: { id },
    method,
  } = req

  console.log('id', req.query)

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
        // Parse the UUIDs array safely
        let array_uuids = []
        if (req.query.ids) {
          try {
            array_uuids = JSON.parse(req.query.ids)
          } catch (parseError) {
            console.error('Error parsing UUIDs:', parseError)
            return res.status(400).json({ error: 'Invalid UUIDs format' })
          }
        }

        const result = await db.query('DELETE FROM links WHERE id = $1', [id])

        if (result.rowCount === 0) {
          return res.status(404).json({ message: 'Item not found' })
        } else {
          if (array_uuids.length > 0) {
            console.log('ids', array_uuids)
            const pineconeResult = await deleteEmbedding(array_uuids)
            console.log('pinecone Delete Result', pineconeResult)
          }
        }

        res
          .status(200)
          .json({ success: true, message: 'URL deleted successfully' })
      } catch (error) {
        console.error('Delete error:', error)
        res.status(500).json({ error: error.message })
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
