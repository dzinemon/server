// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

// connect to database in db file and output the result here as json

import db from '../../../db'
import { v4 as uuidv4 } from 'uuid'

import { parseWithCheerio } from '../../../../utils/cheerio-axios'
import { deleteEmbedding, upsertEmbedding } from '../../../../utils/pinecone'
import { getTextChunks } from '../../../../utils/textbreakdown'

// http://localhost:3000/api/urls

const getUrls = async (req, res) => {
  const result = await db.query('SELECT * FROM links')
  res.status(200).json(result.rows)
}

const postUrl = async (req, res) => {
  const { url } = req.body
  const uuids_array = []
  console.log('START CHEERIO')
  const { pageContent, pageUrl, name } = await parseWithCheerio(url)
  console.log('END CHEERIO')
  console.log('PAGE CONTENT')
  console.log(pageContent)

  const cleanText = await getTextChunks(pageContent)

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
        id: uid,
        url: url,
        title: `${name} ${idx}`,
        content: newStr,
      },
    }
  })

  const pineconeResult = await upsertEmbedding(processedDocs)

  console.log('PINECONE RESULT', pineconeResult)
  console.log('PINECONE RESULT UpsertedCount', pineconeResult.upsertedCount)

  // INSERT INTO links (name, url, uuids) VALUES ('Google', 'https://www.google.com', ARRAY['a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11']::uuid[]);
  // const result = await db.query('INSERT INTO links (name, url, uuids) VALUES ($1, $2, ARRAY[$3]::uuid[]) RETURNING *', [name, url, uuid]);
  // INSERT INTO links (name, url, uuids) VALUES ('Google', 'https://www.google.com', ARRAY['a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13']);

  const result = await db.query(
    'INSERT INTO links (name, url, uuids) VALUES ($1, $2, $3) RETURNING *',
    [name, url, uuids_array]
  )

  res.status(200).json(result.rows)
}

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return getUrls(req, res)
    case 'POST':
      return postUrl(req, res)
    // case 'DELETE':
    //   return deleteUrl(req, res);

    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
