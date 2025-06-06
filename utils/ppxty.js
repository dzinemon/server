import axios from 'axios'

const createPpxtyCompletionMessage = async (messages, model, temperature) => {
  try {
    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model,
        temperature: parseInt(temperature),
        messages,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PPLX_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )
    return response.data.choices[0].message.content
  } catch (error) {
    console.error(
      'Error:',
      error.response ? error.response.data : error.message
    )
    throw error
  }
}

export { createPpxtyCompletionMessage }
