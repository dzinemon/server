import { chatCompletionMessages } from '../../../../utils/openai'
import { createClaudeCompletionMessage } from '../../../../utils/anthropic'
import { createPpxtyCompletionMessage } from '../../../../utils/ppxty' // Fixed typo

const postUrl = async (req, res) => {
  const { messages, model, temperature } = req.body

  // Validate input
  if (!messages || !Array.isArray(messages)) {
    return res
      .status(400)
      .json({ error: 'Invalid or missing "messages" field' })
  }
  if (!model || typeof model !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing "model" field' })
  }
  if (temperature === undefined || typeof temperature !== 'number') {
    return res
      .status(400)
      .json({ error: 'Invalid or missing "temperature" field' })
  }

  try {
    let completion = ''
    let provider = ''

    // Determine the provider and generate completion
    if (model.includes('gpt')) {
      provider = 'openai'
      completion = await chatCompletionMessages(messages, model, temperature)
    } else if (model.includes('claude')) {
      provider = 'anthropic'
      completion = await createClaudeCompletionMessage(
        messages,
        model,
        temperature
      )
    } else {
      provider = 'ppxty'
      completion = await createPpxtyCompletionMessage(
        messages,
        model,
        temperature
      )
    }

    console.log(`Using ${provider}`)
    res.status(200).json({ completion })
  } catch (error) {
    console.error('Error generating completion:', error) // Log error for debugging
    res
      .status(500)
      .json({ error: 'Failed to generate completion. Please try again later.' })
  }
}

export const config = {
  maxDuration: 200,
}

export default function handler(req, res) {
  switch (req.method) {
    case 'POST':
      return postUrl(req, res)
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
