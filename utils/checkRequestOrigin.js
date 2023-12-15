const useLocal = process.env.DB_TYPE === 'local'

const checkRequestOrigin = (req) => {
  const allowedOrigins = useLocal
    ? ['http://localhost:3000']
    : [
        'https://kruzeconsulting.com',
        'https://lush-rock.cloudvent.net',
        'https://kruze-ai-agent.vercel.app',
      ]
  const origin = req.headers.origin
  console.log(`Origin ${origin} is being checked`)

  if (allowedOrigins.includes(origin)) {
    console.log(`Origin ${origin} is allowed`)
    return true
  } else {
    console.log(`Origin ${origin} is not allowed`)
    return false
  }
}

export default checkRequestOrigin
