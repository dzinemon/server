import { useState } from 'react'
import toast from 'react-hot-toast'

import { usedModel } from '../../utils/hardcoded'

export function useAPI() {
  const [isLoading, setIsLoading] = useState(false)
  const [currentSources, setCurrentSources] = useState([])

  const myHeaders = new Headers()
  myHeaders.append('Content-Type', 'application/json')

  // Common API request handler
  const makeAPIRequest = async (
    endpoint,
    body,
    successMessage,
    errorMessage,
    defaultReturn,
    expectedStatus = 200
  ) => {
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(body),
      redirect: 'follow',
    }

    try {
      const response = await fetch(endpoint, requestOptions)

      if (response.status === expectedStatus) {
        console.log('post success')
        if (successMessage) {
          toast(successMessage, {
            icon: '🚀',
            duration: 2000,
          })
        }
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.log('error', error)
      toast(errorMessage || 'Error processing request', {
        icon: '❌',
      })
      return defaultReturn
    }
  }

  // Internal Chat API methods
  const getEmbedding = async (question) => {
    const result = await makeAPIRequest(
      '/api/v1/generateembedding',
      { question },
      'Embedding generated',
      'Error generating embedding',
      { embedding: '' }
    )
    return result.embedding || ''
  }

  const getData = async (embedding, sourceFilters, typeFilters) => {
    const result = await makeAPIRequest(
      '/api/v1/queryembedding',
      {
        embedding,
        sourceFilters,
        typeFilters,
        topK: 8,
      },
      'Data fetched',
      'Error generating completion',
      { data: { matches: [] } }
    )
    return result.data || { matches: [] }
  }

  const getCompletion = async (messages, model = usedModel) => {
    const result = await makeAPIRequest(
      '/api/v1/messages',
      {
        messages,
        model,
        temperature: 0,
      },
      null, // No success toast for completions
      'Error generating completion',
      { completion: 'Sorry, there was an error processing your question.' }
    )
    return result.completion || 'Sorry, I could not generate a response.'
  }

  // Q&A API methods
  const getEmbeddingAndPrompt = async (
    question,
    sourceFilters,
    typeFilters
  ) => {
    const result = await makeAPIRequest(
      '/api/v1/embeddingprompt',
      {
        question,
        sourceFilters,
        typeFilters,
        topK: 8,
      },
      null, // No success toast
      'Error generating completion',
      { sources: [], prompt: '' }
    )
    return result
  }

  const getSingleCompletion = async (prompt, model) => {
    const result = await makeAPIRequest(
      '/api/v1/singlecompletion',
      {
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful startup tax, accounting and bookkeeping assistant.',
          },
          { role: 'user', content: prompt },
        ],
        model,
        temperature: 0,
      },
      null, // No success toast
      'Error generating completion',
      { completion: '' }
    )
    return result.completion || ''
  }

  // Common utility methods
  const saveQuestionAnswer = async (question, answer, resources) => {
    const result = await makeAPIRequest(
      '/api/questions',
      {
        question,
        answer,
        resources,
      },
      null, // No success toast
      'Error saving question',
      null,
      201 // Expected status for creation
    )
    return result
  }

  return {
    // Common state
    isLoading,
    setIsLoading,
    currentSources,
    setCurrentSources,

    // Internal Chat API methods
    getEmbedding,
    getData,
    getCompletion,

    // Q&A API methods
    getEmbeddingAndPrompt,
    getSingleCompletion,

    // Common utility methods
    saveQuestionAnswer,
  }
}

// Specific hooks for backward compatibility and cleaner imports
export function useInternalChatAPI() {
  const api = useAPI()
  return {
    isLoading: api.isLoading,
    setIsLoading: api.setIsLoading,
    currentSources: api.currentSources,
    setCurrentSources: api.setCurrentSources,
    getEmbedding: api.getEmbedding,
    getData: api.getData,
    getCompletion: api.getCompletion,
  }
}

export function useQAAPI() {
  const api = useAPI()
  return {
    isLoading: api.isLoading,
    setIsLoading: api.setIsLoading,
    getEmbeddingAndPrompt: api.getEmbeddingAndPrompt,
    getCompletion: api.getSingleCompletion,
    saveQuestionAnswer: api.saveQuestionAnswer,
  }
}
