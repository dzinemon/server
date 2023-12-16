// import db

import db from '../../../db'

// http://localhost:3000/api/questions

import rateLimit from '../../../../utils/rate-limit'

const limiter = rateLimit({
  // interval: 60 * 1000, // 1 minute
  interval: 20 * 60 * 60 * 1000, // 20 hrs
  uniqueTokenPerInterval: 5, // Max 500 users per minute
})

const getAllQa = async (req, res) => {
  // if (req.origin == 'http://localhost:3000'  || req.origin == 'https://kruze-ai-agent.vercel.app') {
  //   return res.status(200).json({ message: 'OK' })
  // }
  // const result = await db.query('SELECT * FROM qas')
  // res.status(200).json(result.rows)
}

const addQa = async (req, res) => {
  const { question, answer, resources } = req.body

  try {
    await limiter.check(req, res, 5, 'CACHE_TOKEN') // 5 requests per minute
    const result = await db.query(
      'INSERT INTO qas (question, answer, resources) VALUES ($1, $2, $3) RETURNING *',
      [question, answer, resources]
    )
    res.status(200).json(result.rows)
  } catch (error) {
    console.log('error', error)
    res.status(429).json({ error: 'Rate limit exceeded' })
  }
}

const deleteQa = async (req, res) => {
  const { id } = req.body
  const result = await db.query('DELETE FROM qas WHERE id = $1 RETURNING *', [
    id,
  ])
  res.status(200).json(result.rows)
}

export default async function handler(req, res) {
  // const originAllowed = checkRequestOrigin(req)

  // if (!originAllowed) {
  //   res.status(403).end(`Origin ${req.headers.origin} is not allowed`)
  //   return
  // }

  switch (req.method) {
    case 'GET':
      try {
        await limiter.check(req, res, 4, 'CACHE_TOKEN') // 5 requests per minute
        return res.status(200).json({ message: 'OK' })
      } catch (error) {
        console.log('error', error)
        return res.status(429).json({
          // error: 'Rate limit exceeded',
          message: 'Rimit reached',
        })
      }

      break
    case 'POST':
      try {
        await limiter.check(req, res, 4, 'CACHE_TOKEN') // 5 requests per minute
        const result = await db.query(
          'INSERT INTO qas (question, answer, resources) VALUES ($1, $2, $3) RETURNING *',
          [question, answer, resources]
        )
        return res.status(200).json(result.rows)
      } catch (error) {
        console.log('error', error)
        return res.status(429).json({
          // error: 'Rate limit exceeded',
          message: 'Rimit reached',
        })
      }

    case 'DELETE':
      await deleteQa(req, res)
      break

    default:
      res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
