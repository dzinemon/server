import { measureTokenCount } from '../../../../utils/tokensplitter'

import { parseWithCheerio } from '../../../../utils/cheerio-axios'

// http://localhost:3000/api/token-counter

// write function that will accept text and return token count by getting length of text and dividing by 4 and return tokensCount

// optimize this tokenCount function

const tokenCount = async (text) => Math.round(text.length / 4)

const postUrl = async (req, res) => {
  const { urls } = req.body

  console.log('urls', urls)

  // split urls into array by comma

  const urlsArray = urls.split(',').map((url) => url.trim())

  const uniqueUrls = [...new Set(urlsArray)]

  // for each url, parse with cheerio with a delay

  const parsedUrls = await uniqueUrls.map(async (url) => {
    await new Promise((resolve) => setTimeout(resolve, 3000)) //
    console.log('=>>>>> url =>>>>>', url)

    const { pageContent, pageUrl, name } = await parseWithCheerio(url.trim())

    const tokensCount = await tokenCount(pageContent)

    return { tokensCount, name, pageUrl }
  })

  // return array of objects with tokensCount, name, pageUrl

  const result = await Promise.all(parsedUrls)

  console.log('RESULT', result)

  return res.status(200).json(result)
}

// add uuid to doc metadata

export default async function tokenCounter(req, res) {
  const { method } = req
  switch (method) {
    case 'POST':
      return postUrl(req, res)

    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
