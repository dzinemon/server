import { chatCompletionMessagesStream } from '../../../../utils/openai'
import { createClaudeCompletionMessage } from '../../../../utils/anthropic'
import { createPpxtyCompletionMessageStream } from '../../../../utils/ppxty'

const postUrl = async (req, res) => {
  const { messages, model, temperature } = req.body

  console.log('Streaming request received:', {
    model,
    temperature,
    messageCount: messages?.length,
  })

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
    // Set headers for streaming
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    })

    let provider = ''

    // Determine the provider and generate completion
    if (model.includes('gpt')) {
      provider = 'openai'
      console.log(`Using ${provider} streaming`)

      const stream = await chatCompletionMessagesStream(
        messages,
        model,
        temperature
      )

      let chunkCount = 0
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || ''
        if (content) {
          chunkCount++
          console.log(`OpenAI chunk ${chunkCount}:`, content.slice(0, 50))
          res.write(content)
          // Flush the response to ensure it's sent immediately
          if (res.flush) res.flush()
        }
      }
      console.log(`OpenAI streaming completed with ${chunkCount} chunks`)
    } else if (model.includes('claude')) {
      provider = 'anthropic'
      console.log(`Using ${provider} (non-streaming fallback)`)

      // Claude doesn't support streaming in this implementation, fallback to regular
      const completion = await createClaudeCompletionMessage(
        messages,
        model,
        temperature
      )
      // Simulate streaming for Claude by writing character by character
      for (let i = 0; i < completion.length; i += 10) {
        res.write(completion.slice(i, i + 10))
        if (res.flush) res.flush()
        // Minimal delay to avoid overwhelming the client
        await new Promise((resolve) => setTimeout(resolve, 10))
      }
    } else {
      provider = 'ppxty'
      console.log(`Using ${provider} streaming`)

      const stream = await createPpxtyCompletionMessageStream(
        messages,
        model,
        temperature
      )

      return new Promise((resolve, reject) => {
        let chunkCount = 0
        let buffer = ''

        stream.on('data', (chunk) => {
          buffer += chunk.toString()
          const lines = buffer.split('\n')
          buffer = lines.pop() // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim()
              if (data === '[DONE]') {
                console.log(
                  `Perplexity streaming completed with ${chunkCount} chunks`
                )
                res.end()
                resolve()
                return
              }
              if (data && data !== '') {
                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices[0]?.delta?.content || ''
                  if (content) {
                    chunkCount++
                    res.write(content)
                    if (res.flush) res.flush()
                  }
                } catch (e) {
                  console.warn('Failed to parse SSE data:', data.slice(0, 100))
                }
              }
            }
          }
        })

        stream.on('end', () => {
          console.log(`Perplexity streaming ended with ${chunkCount} chunks`)
          res.end()
          resolve()
        })

        stream.on('error', (error) => {
          console.error('Perplexity stream error:', error)
          res.end()
          reject(error)
        })
      })
    }

    res.end()
  } catch (error) {
    console.error('Error generating completion:', error)
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Failed to generate completion. Please try again later.',
      })
    } else {
      res.end()
    }
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
