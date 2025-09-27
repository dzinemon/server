const useLocal = process.env.DB_TYPE === 'local'

const checkRequestOrigin = (req) => {
  let allowedOrigins = []

  if (useLocal) {
    allowedOrigins = ['http://localhost:3000']
  } else {
    allowedOrigins = [
      'https://kruzeconsulting.com',
      'https://lush-rock.cloudvent.net',
      'https://kruze-ai-agent.vercel.app',
    ]

    // Add Vercel deployment URLs
    if (process.env.VERCEL_URL) {
      allowedOrigins.push(`https://${process.env.VERCEL_URL}`)
    }

    // Add custom domain if set
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      allowedOrigins.push(process.env.NEXT_PUBLIC_SITE_URL)
    }
  }

  const origin = req.headers.origin
  console.log(`Origin ${origin} is being checked against:`, allowedOrigins)

  if (allowedOrigins.includes(origin)) {
    console.log(`Origin ${origin} is allowed`)
    return true
  } else {
    console.log(`Origin ${origin} is not allowed`)
    return false
  }
}

export default checkRequestOrigin
