// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

// connect to database in db file and output the result here as json

import db from '../../../db'
import { v4 as uuidv4 } from 'uuid'

import { parseWithCheerio } from '../../../../utils/cheerio-axios'
import { deleteAllVectors, upsertEmbedding } from '../../../../utils/pinecone'
import { getTextChunks } from '../../../../utils/textbreakdown'

const getUrls = async (req, res) => {
  const result = await db.query(
    'SELECT id, name, url, uuids, created_at FROM links'
  )
  res.status(200).json(result.rows)
}

const postUrls = async (req, res) => {
  const { url, internal } = req.body
  const uuids_array = []
  // console.log('START CHEERIO')
  const { pageContent, pageUrl, name, ogImage, pageType, source } =
    await parseWithCheerio(url)
  // console.log('END CHEERIO')
  // console.log('PAGE CONTENT')
  // console.log(pageContent)

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
        content: newStr,
        id: uid,
        url: url,
        title: name,
        image: ogImage,
        source: internal ? 'internal' : source,
        type: pageType,
      },
    }
  })

  const pineconeResult = await upsertEmbedding(processedDocs)

  if (pineconeResult && pineconeResult.upsertedCount) {
    console.log('Pinecone UpsertCount: ', pineconeResult.upsertedCount)
  }

  // console.log('PINECONE RESULT', pineconeResult)
  // console.log('PINECONE RESULT UpsertedCount', pineconeResult.upsertedCount)

  // INSERT INTO links (name, url, uuids) VALUES ('Google', 'https://www.google.com', ARRAY['a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11']::uuid[]);
  // const result = await db.query('INSERT INTO links (name, url, uuids) VALUES ($1, $2, ARRAY[$3]::uuid[]) RETURNING *', [name, url, uuid]);
  // INSERT INTO links (name, url, uuids) VALUES ('Google', 'https://www.google.com', ARRAY['a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13']);

  const result = await db.query(
    'INSERT INTO links (name, url, uuids, created_at, updated_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *',
    [name, url, uuids_array]
  )

  res.status(200).json(result.rows)
}

const deleteUrls = async (req, res) => {
  // delete all urls from links table

  const result = await db.query('DELETE FROM links')

  console.log('Deleted all rows from links table')
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
      return getUrls(req, res)
    case 'POST':
      return postUrls(req, res)
    case 'DELETE':
      return deleteUrls(req, res)

    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
