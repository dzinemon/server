import React, { createContext, useState, useContext, useEffect } from 'react'

import { baseUrl } from '../../utils/config'


const PromptContext = createContext()

export const PromptProvider = ({ children }) => {
  const promptsUrl = `${baseUrl}/api/prompts`

  const [prompts, setPrompts] = useState([])
  const [loading, setLoading] = useState(false)

  const [currentPrompt, setCurrentPrompt] = useState({})

  const fetchPrompts = async () => {
    setLoading(true)
    const res = await fetch(promptsUrl)
    const prompts = await res.json()
    setPrompts(prompts)
    setLoading(false)
  }

  return (
    <PromptContext.Provider value={{ 
      prompts, loading, fetchPrompts, 
      currentPrompt, setCurrentPrompt
      }}>
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

