import { useState } from 'react'
import toast from 'react-hot-toast'

export function useInternalChatAPI() {
  const [isLoading, setIsLoading] = useState(false)
  const [currentSources, setCurrentSources] = useState([])

  const myHeaders = new Headers()
  myHeaders.append('Content-Type', 'application/json')

  const getEmbedding = async (question) => {
    const questionRequestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        question: question,
      }),
      redirect: 'follow',
    }

    try {
      const response = await fetch('/api/v1/generateembedding', questionRequestOptions)
      
      if (response.status === 200) {
        console.log('post success')
        toast('Embedding generated', {
          icon: '🚀',
          duration: 2000,
        })
      }
      
      const result = await response.json()
      return result.embedding
    } catch (error) {
      console.log('error', error)
      toast('Error generating embedding', {
        icon: '❌',
      })
      return ''
    }
  }

  const getData = async (embedding, sourceFilters, typeFilters) => {
    const questionRequestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        embedding: embedding,
        sourceFilters: sourceFilters,
        typeFilters: typeFilters,
        topK: 8,
      }),
      redirect: 'follow',
    }

    try {
      const response = await fetch('/api/v1/queryembedding', questionRequestOptions)
      
      if (response.status === 200) {
        console.log('post success')
        toast('Data fetched', {
          icon: '🚀',
          duration: 2000,
        })
      }
      
      const result = await response.json()
      return result.data
    } catch (error) {
      console.log('error', error)
      toast('Error generating completion', {
        icon: '❌',
      })
      return { matches: [] }
    }
  }

  const getCompletion = async (messages, model) => {
    try {
      const response = await fetch('/api/openai/messages', {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify({
          messages: messages,
          model: model,
          temperature: 0.1,
        }),
        redirect: 'follow',
      })

      if (response.status === 200) {
        console.log('post success')
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
    currentSources,
    setCurrentSources,
    getEmbedding,
    getData,
    getCompletion,
  }
}
