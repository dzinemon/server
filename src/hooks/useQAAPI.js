import { useState } from 'react'
import toast from 'react-hot-toast'

export function useQAAPI() {
  const [isLoading, setIsLoading] = useState(false)

  const myHeaders = new Headers()
  myHeaders.append('Content-Type', 'application/json')

  const getEmbeddingAndPrompt = async (question, sourceFilters, typeFilters) => {
    const questionRequestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        question: question,
        sourceFilters: sourceFilters,
        typeFilters: typeFilters,
        topK: 8,
      }),
      redirect: 'follow',
    }

    try {
      const response = await fetch('/api/openai/embedding', questionRequestOptions)
      
      if (response.status === 200) {
        console.log('post success')
        console.log(response)
      }
      
      const result = await response.json()
      return result
    } catch (error) {
      console.log('error', error)
      toast('Error generating completion', {
        icon: '❌',
      })
      return { sources: [], prompt: '' }
    }
  }

  const getCompletion = async (prompt, model) => {
    const promptRequestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a helpful startup tax, accounting and bookkeeping assistant.',
          },
          { role: 'user', content: prompt },
        ],
        model: model,
        temperature: 0.1,
      }),
      redirect: 'follow',
    }

    try {
      const response = await fetch('/api/v1/singlecompletion', promptRequestOptions)
      
      if (response.status === 200) {
        console.log('post success')
        console.log(response)
      }
      
      const result = await response.json()
      return result.completion
    } catch (error) {
      console.log('error', error)
      toast('Error generating completion', {
        icon: '❌',
      })
      return ''
    }
  }

  return {
    isLoading,
    setIsLoading,
    getEmbeddingAndPrompt,
    getCompletion,
  }
}
