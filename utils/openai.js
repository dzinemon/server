import OpenAI from 'openai'

const configuration = {
  organization: process.env.OPENAI_ORGANIZATION,
  apiKey: process.env.OPENAI_API_KEY,
}

const generateEmbedding = async (document) => {
  const openai = new OpenAI(configuration)

  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: document,
  })

  const totalTokens = response.usage.total_tokens

  console.log('totalTokens', totalTokens)

  console.log('response', response)

  const embedding = response.data[0].embedding
  return embedding
}

const createChatCompletion = async (prompt) => {
  const openai = new OpenAI(configuration)

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo-16k-0613',
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful startup tax, accounting and bookkeeping assistant.',
      },
      { role: 'user', content: prompt },
    ],
    stream: false,
  })

  console.log(completion.choices)

  return completion.choices[0].message.content
  // return completion
}

export { generateEmbedding, createChatCompletion }
