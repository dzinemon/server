import OpenAI from 'openai'

const configuration = {
  organization: process.env.OPENAI_ORGANIZATION,
  apiKey: process.env.OPENAI_API_KEY,
}

const openai = new OpenAI(configuration)

const generateEmbedding = async (document) => {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: document,
    })
    const embedding = response.data[0].embedding
    return embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw error
  }
}

const createChatCompletionCustom = async (
  prompt,
  model,
  temperature,
  instructions,
  maxTokens
) => {
  try {
    const openai = new OpenAI(configuration)

    const completion = await openai.chat.completions.create({
      model,
      temperature: parseInt(temperature),
      messages: [
        {
          role: 'system',
          content: instructions,
        },
        { role: 'user', content: prompt },
      ],
      stream: false,
      max_tokens: parseInt(maxTokens),
    })

    return completion.choices[0].message.content
  } catch (error) {
    console.error('Error creating chat completion:', error)
    throw error
  }
}

// create chatCompletionMessages that will accept messages as an array of objects, model, temperature

const chatCompletionMessages = async (messages, model, temperature) => {
  try {
    const completion = await openai.chat.completions.create({
      model,
      temperature: temperature,
      messages: messages,
      stream: false,
    })

    return completion.choices[0].message.content
  } catch (error) {
    console.error('Error creating chat completion:', error)
    throw error
  }
}

export { chatCompletionMessages, createChatCompletionCustom, generateEmbedding }
