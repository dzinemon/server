import OpenAI from 'openai'

const configuration = {
  organization: process.env.OPENAI_ORGANIZATION,
  apiKey: process.env.OPENAI_API_KEY,
}

const generateEmbedding = async (document) => {
  const openai = new OpenAI(configuration)
  // console.log('start gen embedding  - - - - >')
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: document,
    })
    // console.log(' embedding response  - - - - >')
    const totalTokens = response.usage.total_tokens
    // console.log('totalTokens', totalTokens)
    // console.log('response', response)
    const embedding = response.data[0].embedding
    return embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw error
  }
}

const createChatCompletionCustom = async (prompt, model, temperature, instructions) => {
  try {
    const openai = new OpenAI(configuration)

    const completion = await openai.chat.completions.create({
      model,
      temperature: parseInt(temperature) / 100,
      messages: [
        {
          role: 'system',
          content: instructions,
        },
        { role: 'user', content: prompt },
      ],
      stream: false,
    })

    // console.log(completion.choices)

    return completion.choices[0].message.content
  } catch (error) {
    console.error('Error creating chat completion:', error)
    throw error
  }
}

const createChatCompletion = async (prompt) => {
  try {
    const openai = new OpenAI(configuration)

    const completion = await openai.chat.completions.create({
      // model: 'gpt-3.5-turbo-16k-0613',
      model: 'gpt-4o',
      temperature: 0.1,
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

    // console.log(completion.choices)

    return completion.choices[0].message.content
  } catch (error) {
    console.error('Error creating chat completion:', error)
    throw error
  }
}

export { generateEmbedding, createChatCompletion, createChatCompletionCustom }
