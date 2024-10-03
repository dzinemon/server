import React, { createContext, useState, useContext, useEffect } from 'react'

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

  const [contentPrompts, setContentPrompts] = useState([])

  const [aiPrompts, setAiPrompts] = useState([])

  const [reposterPrompts, setReposterPrompts] = useState([])

  useEffect(() => {
    // set prompts after prompts change, use type to filter

    // types: 'ai', 'content', 'reposter'

    const contentPrompts = prompts.filter((prompt) => prompt.type === 'content')

    const aiPrompts = prompts.filter((prompt) => prompt.type === 'ai')

    const reposterPrompts = prompts.filter(
      (prompt) => prompt.type === 'reposter'
    )

    setContentPrompts(contentPrompts)
    setAiPrompts(aiPrompts)
    setReposterPrompts(reposterPrompts)
  }, [prompts])

  const fetchPrompts = async () => {
    setLoading(true)
    try {
      const res = await fetch(promptsUrl, { next: { revalidate: 86400 } })
      const prompts = await res.json()
      setPrompts(prompts)
    } catch (error) {
      console.error('Failed to fetch prompts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePromptDelete = async (id) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/prompts/${id}`, {
        method: 'DELETE',
        headers: myHeaders,
      })
      const data = await res.json()
      const updatedPrompts = prompts.filter((prompt) => prompt.id !== id)
      setPrompts(updatedPrompts)
      console.log(data)
      toast.success('Prompt deleted', {
        icon: '🗑️',
        duration: 2500,
      })
    } catch (error) {
      console.error('Error deleting prompt:', error)
      toast.error('Error deleting prompt', {
        icon: '❌',
        duration: 2500,
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePromptUpdate = async (id, data) => {
    // data is Id name and content

    try {
      setLoading(true)
      const res = await fetch(`/api/prompts/${id}`, {
        method: 'PUT',
        headers: myHeaders,
        body: JSON.stringify(data),
      })
      const updatedPrompt = await res.json()
      const updatedPrompts = prompts.map((prompt) =>
        prompt.id === id ? updatedPrompt : prompt
      )
      setPrompts(updatedPrompts)

      toast.success('Prompt updated', {
        icon: '🔄',
        duration: 2500,
      })
    } catch (error) {
      console.error('Error updating prompt:', error)
      toast.error('Error updating prompt', {
        icon: '❌',
        duration: 2500,
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePromptCreate = async (data) => {
    try {
      setLoading(true)
      const res = await fetch(promptsUrl, {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(data),
      })
      const newPrompt = await res.json()
      setPrompts([...prompts, newPrompt])
      toast.success('Prompt created', {
        icon: '🎉',
        duration: 2500,
      })
    } catch (error) {
      console.error('Error creating prompt:', error)
      toast.error('Error creating prompt', {
        icon: '❌',
        duration: 2500,
      })
    } finally {
      setLoading(false)
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
