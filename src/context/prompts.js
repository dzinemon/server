import React, { createContext, useState, useContext } from 'react'
import { baseUrl } from '../../utils/config'
import toast from 'react-hot-toast'

const PromptContext = createContext()

export const PromptProvider = ({ children }) => {
  const myHeaders = new Headers()
  myHeaders.append('Content-Type', 'application/json')

  const promptsUrl = `${baseUrl}/api/prompts`

  const [prompts, setPrompts] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPrompt, setCurrentPrompt] = useState({})
  const [fetchedPrompts, setFetchedPrompts] = useState([])
  const [contentPrompts, setContentPrompts] = useState([])
  const [aiPrompts, setAiPrompts] = useState([])
  const [reposterPrompts, setReposterPrompts] = useState([])

  const fetchData = async (url, options = {}) => {
    setLoading(true)
    try {
      const res = await fetch(url, options)
      return await res.json()
    } catch (error) {
      console.error('Error fetching data:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const fetchPrompts = async () => {
    try {
      const prompts = await fetchData(promptsUrl, { next: { revalidate: 86400 } })
      setPrompts(prompts)
    } catch (error) {
      console.error('Failed to fetch prompts:', error)
    }
  }

  const fetchPromptsByType = async (type) => {
    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
    }
    return await fetchData(`${promptsUrl}/?type=${type}`, requestOptions)
  }

  const fetchContentPrompts = async () => {
    const prompts = await fetchPromptsByType('content')
    setContentPrompts((prev) => [...prev, ...prompts])
  }

  const fetchAiPrompts = async () => {
    const prompts = await fetchPromptsByType('ai')
    setAiPrompts((prev) => [...prev, ...prompts])
  }

  const fetchReposterPrompts = async () => {
    const prompts = await fetchPromptsByType('reposter')
    setReposterPrompts((prev) => [...prev, ...prompts])
  }

  const handlePromptFetch = async (id) => {
    try {
      const prompt = await fetchData(`/api/prompts/${id}`, {
        method: 'GET',
        headers: myHeaders,
      })
      setFetchedPrompts((prev) => {
        const updatedPrompts = prev.filter((p) => p.id !== prompt.id)
        return [...updatedPrompts, prompt]
      })
      return prompt
    } catch (error) {
      console.error('Error fetching prompt:', error)
    }
  }

  const handlePromptDelete = async (id) => {
    try {
      await fetchData(`/api/prompts/${id}`, {
        method: 'DELETE',
        headers: myHeaders,
      })
      setPrompts((prev) => prev.filter((prompt) => prompt.id !== id))
      setFetchedPrompts((prev) => prev.filter((p) => p.id !== id))
      updatePromptLists(id, 'delete')
      toast.success('Prompt deleted', { icon: '🗑️', duration: 2500 })
    } catch (error) {
      console.error('Error deleting prompt:', error)
      toast.error('Error deleting prompt', { icon: '❌', duration: 2500 })
    }
  }

  const handlePromptUpdate = async (id, data) => {
    try {
      const updatedPrompt = await fetchData(`/api/prompts/${id}`, {
        method: 'PUT',
        headers: myHeaders,
        body: JSON.stringify(data),
      })
      setPrompts((prev) => prev.map((prompt) => (prompt.id === id ? updatedPrompt : prompt)))
      setFetchedPrompts((prev) => {
        const exists = prev.some((p) => p.id === id)
        if (exists) {
          const updatedPrompts = prev.filter((p) => p.id !== id)
          return [...updatedPrompts, updatedPrompt]
        } else {
          return [...prev, updatedPrompt]
        }
      })
      updatePromptLists(id, 'update', updatedPrompt)
      toast.success('Prompt updated', { icon: '🔄', duration: 2500 })
    } catch (error) {
      console.error('Error updating prompt:', error)
      toast.error('Error updating prompt', { icon: '❌', duration: 2500 })
    }
  }

  const handlePromptCreate = async (data) => {
    try {
      const newPrompt = await fetchData(promptsUrl, {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(data),
      })
      setPrompts((prev) => [...prev, newPrompt])
      updatePromptLists(null, 'create', newPrompt)
      toast.success('Prompt created', { icon: '🎉', duration: 2500 })
    } catch (error) {
      console.error('Error creating prompt:', error)
      toast.error('Error creating prompt', { icon: '❌', duration: 2500 })
    }
  }

  const updatePromptLists = (id, action, prompt = null) => {
    const updateList = (list, type) => {
      if (action === 'delete') {
        return list.filter((p) => p.id !== id)
      } else if (action === 'update') {
        return list.map((p) => (p.id === id ? prompt : p))
      } else if (action === 'create') {
        return [...list, prompt]
      }
    }

    if (prompt?.type === 'content' || currentPrompt.type === 'content') {
      setContentPrompts((prev) => updateList(prev, 'content'))
    }
    if (prompt?.type === 'ai' || currentPrompt.type === 'ai') {
      setAiPrompts((prev) => updateList(prev, 'ai'))
    }
    if (prompt?.type === 'reposter' || currentPrompt.type === 'reposter') {
      setReposterPrompts((prev) => updateList(prev, 'reposter'))
    }
  }

  return (
    <PromptContext.Provider
      value={{
        prompts,
        loading,
        fetchPrompts,
        currentPrompt,
        setCurrentPrompt,
        contentPrompts,
        aiPrompts,
        reposterPrompts,
        handlePromptDelete,
        handlePromptUpdate,
        handlePromptCreate,
        handlePromptFetch,
        fetchedPrompts,
        fetchContentPrompts,
        fetchAiPrompts,
        fetchReposterPrompts,
      }}
    >
      {children}
    </PromptContext.Provider>
  )
}

export const usePrompts = () => {
  const context = useContext(PromptContext)
  if (context === undefined) {
    throw new Error('usePrompts must be used within a PromptProvider')
  }
  return context
}
