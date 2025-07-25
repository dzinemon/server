import db from '../../../db'
import { formidable } from 'formidable'
import fs from 'fs'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'

import { v4 as uuidv4 } from 'uuid'
import { deleteEmbedding, upsertEmbedding } from '../../../../utils/pinecone'

// const upload = multer({ dest: 'uploads/' });

const postAction = async (req, res) => {
  const uuids_array = []

  try {
    const form = new formidable.IncomingForm()
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error(err)
        return res.status(500).json({ error: 'Error parsing form data' })
      }

      const { file } = files
      const { name, type, path } = file

      // Process the file as needed
      console.log('File name:', name)
      // Run any required functions with the file

      // Example: Move the file to a specific directory
      const newPath = `./public/uploads/${name}`
      fs.renameSync(path, newPath)

      const loader = new PDFLoader(newPath)

      // load the document
      const docs = await loader.load()
      const processedDocs = []

      // Convert the JSON into the desired format
      docs.forEach((page, index) => {
        const uid = uuidv4()
        uuids_array.push(uid)

        const item = {
          id: uid,
          url: `${name} Page ${index + 1}`,
          title: `${name} Page  ${index + 1}`,
          content: page.text,
        }

        processedDocs.push(item)
      })

      const pineconeResult = await upsertEmbedding(processedDocs)

      if (pineconeResult && pineconeResult.upsertedCount) {
        console.log('Pinecone UpsertCount: ', pineconeResult.upsertedCount)
      }

      const result = await db.query(
        'INSERT INTO pdf_file (name, url, uuids) VALUES ($1, $2, $3) RETURNING *',
        [name, name, uuids_array]
      )

      // res.status(200).json(result.rows);

      // Return a response
      return res.status(200).json({ message: 'File uploaded successfully' })
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

const getAction = async (req, res) => {
  const result = await db.query('SELECT * FROM pdf_file')
  res.status(200).json(result.rows)
}

export default async function handler(req, res) {
  switch (req.method) {
    case 'POST':
      return postAction(req, res)
    case 'GET':
      return getAction(req, res)

    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
