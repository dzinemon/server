// import db

import db from '../../../db'

import { v4 as uuidv4 } from 'uuid'
import { deleteEmbedding, upsertEmbedding } from '../../../../utils/pinecone'
import { getTextChunks } from '../../../../utils/textbreakdown'

// http://localhost:3000/api/texts

const getAllTexts = async (req, res) => {
  const result = await db.query('SELECT * FROM text_items')
  res.status(200).json(result.rows)
}

const addText = async (req, res) => {
  const { name, text } = req.body

  // using text limit to split text into chunks of not exeeding 8000 characters

  const cleanText = await getTextChunks(text)

  const uuids_array = []

  const processedDocs = cleanText.map((text, idx) => {
    const uid = uuidv4()
    const theString = text.trim()
    const newStr = theString.replace(/\s+/g, ' ')
    uuids_array.push(uid)
    console.log('UID', uid)
    return {
      id: uid,
      metadata: {
        id: uid,
        url: `${name} ${idx}`,
        title: `${name} ${idx}`,
        content: newStr,
      },
    }
  })
  // add text to pinecone

  const pineconeResult = await upsertEmbedding(processedDocs)

  console.log('PINECONE RESULT', pineconeResult)
  console.log('PINECONE RESULT UpsertedCount', pineconeResult.upsertedCount)

  const result = await db.query(
    'INSERT INTO text_items (name, text, uuids) VALUES ($1, $2, $3) RETURNING *',
    [name, text, uuids_array]
  )

  res.status(200).json(result.rows)
}

const deleteText = async (req, res) => {
  const { id } = req.body
  const result = await db.query(
    'DELETE FROM text_items WHERE id = $1 RETURNING *',
    [id]
  )
  res.status(200).json(result.rows)
}

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      await getAllTexts(req, res)
      break
    case 'POST':
      await addText(req, res)
      break

    case 'DELETE':
      await deleteText(req, res)
      break

    default:
      res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
