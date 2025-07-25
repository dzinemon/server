// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

// connect to database in db file and output the result here as json

import db from '../../../db'
import { v4 as uuidv4 } from 'uuid'

import { deleteAllVectors, upsertEmbedding } from '../../../../utils/pinecone'
import { getTextChunks } from '../../../../utils/textbreakdown'

const getCsv = async (req, res) => {
  const result = await db.query('SELECT * FROM csv_file')
  res.status(200).json(result.rows)
}

const postCsv = async (req, res) => {
  const { url, source, title, text, image, type } = req.body
  const uuids_array = []

  const cleanText = await getTextChunks(text)

  // add uuid to doc metadata

  const processedDocs = await cleanText.map((doc, idx) => {
    const uid = uuidv4()
    const theString = doc.trim()
    const newStr = theString.replace(/\s+/g, ' ')
    uuids_array.push(uid)
    console.log('UID', uid)
    return {
      id: uid,
      metadata: {
        content: newStr,
        id: uid,
        url: url,
        title: title,
        image: image,
        source: source,
        type: type,
      },
    }
  })

  const pineconeResult = await upsertEmbedding(processedDocs)

  if (pineconeResult && pineconeResult.upsertedCount) {
    console.log('Pinecone UpsertCount: ', pineconeResult.upsertedCount)
  }

  // INSERT INTO links (name, url, uuids) VALUES ('Google', 'https://www.google.com', ARRAY['a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11']::uuid[]);
  // const result = await db.query('INSERT INTO links (name, url, uuids) VALUES ($1, $2, ARRAY[$3]::uuid[]) RETURNING *', [name, url, uuid]);
  // INSERT INTO links (name, url, uuids) VALUES ('Google', 'https://www.google.com', ARRAY['a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13']);

  const result = await db.query(
    'INSERT INTO csv_file (name, url, uuids) VALUES ($1, $2, $3) RETURNING *',
    [title, url, uuids_array]
  )

  res.status(200).json(result.rows)
}

const deleteCsv = async (req, res) => {
  // delete all urls from links table

  const result = await db.query('DELETE FROM csv_file')

  console.log('Deleted all rows from csv_file table')
  console.log(result)

  // delete all vectors from pinecone

  const pineconeResult = await deleteAllVectors()
  console.log('Deleted all vectors from pinecone')
  console.log('PINECONE RESULT', pineconeResult)

  res.status(200).json({
    message: 'Deleted all links and vectors from pinecone',
  })
}

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return getCsv(req, res)
    case 'POST':
      return postCsv(req, res)
    case 'DELETE':
      return deleteCsv(req, res)

    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
