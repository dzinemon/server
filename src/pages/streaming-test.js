import { useState } from 'react'

export default function StreamingTest() {
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const testStreaming = async () => {
    setIsLoading(true)
    setResponse('')

    try {
      const res = await fetch('/api/v1/singlecompletionstream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant.',
            },
            {
              role: 'user',
              content: 'Count from 1 to 10, putting each number on a new line.',
            },
          ],
          model: 'gpt-4o-mini-2024-07-18',
          temperature: 0,
        }),
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk
        console.log('Received chunk:', chunk)
        setResponse(fullText)
      }
    } catch (error) {
      console.error('Error:', error)
      setResponse('Error: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Streaming Test</h1>

      <button
        onClick={testStreaming}
        disabled={isLoading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        {isLoading ? 'Streaming...' : 'Test Streaming'}
      </button>

      <div className="mt-4 p-4 border rounded">
        <h2 className="font-bold mb-2">Response:</h2>
        <pre className="whitespace-pre-wrap">{response}</pre>
      </div>
    </div>
  )
}
