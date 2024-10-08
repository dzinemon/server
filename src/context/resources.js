import React, { createContext, useState, useContext, useEffect } from 'react'
import { baseUrl } from '../../utils/config'
import toast from 'react-hot-toast'

import { models } from '../../utils/hardcoded'

const ResourceContext = createContext()

export const ResourceProvider = ({ children }) => {
  const myHeaders = new Headers()
  myHeaders.append('Content-Type', 'application/json')
  // Define your resource data and any other required state here
  const url = `${baseUrl}/api/questions/all`

  const [resources, setResources] = useState([])
  const [currentModel, setCurrentModel] = useState(models[0])
  const [currentThread, setCurrentThread] = useState({})
  const [loading, setLoading] = useState(false)

  const [text, setText] = useState('')

  const [markdownContent, setMarkdownContent] = useState('')

  const handleTextChange = (text) => {
    setText(text)
  }

  const handleMarkdownChange = (text) => {
    setMarkdownContent(text)
  }

  const [allQuestions, setAllQuestions] = useState([])

  const fetchAllQuestions = async () => {
    setLoading(true)
    try {
      const res = await fetch(url, { next: { revalidate: 86400 } })
      const questions = await res.json()
      toast.success('Questions loaded', {
        icon: '✅',
        duration: 2500,
      })
      setAllQuestions(questions)
    } catch (error) {
      console.error('Failed to fetch questions:', error)
      toast.error('Error fetching questions', {
        icon: '❌',
        duration: 2500,
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchQuestionById = async (id) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/questions/${id}`, {
        next: { revalidate: 86400 },
      })
      const question = await res.json()
      console.log(question)
      toast.success('Successfully loaded', {
        icon: '✅', //check
        duration: 1500,
      })

      return question
    } catch (error) {
      console.error('Failed to fetch question:', error)
      toast.error('Error fetching question', {
        icon: '❌',
        duration: 2500,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleQuestionDelete = async (id) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/questions/${id}`, {
        method: 'DELETE',
        headers: myHeaders,
      })
      const data = await res.json()
      const updatedQuestions = allQuestions.filter(
        (question) => question.id !== id
      )
      setAllQuestions(updatedQuestions)
      console.log(data)
      toast.success('Question deleted', {
        icon: '🗑️',
        duration: 2500,
      })
    } catch (error) {
      console.error('Error deleting question:', error)
      toast.error('Error deleting question', {
        icon: '❌',
        duration: 2500,
      })
    } finally {
      setLoading(false)
    }
  }

  // Add any other functions or methods needed to modify resource data

  // Provide the resource data and any necessary methods to child components

  useEffect(() => {
    setMarkdownContent(text)
  }, [text])

  return (
    <ResourceContext.Provider
      value={{
        loading,
        resources,
        setResources,
        allQuestions,
        fetchAllQuestions,
        text,
        handleTextChange,
        markdownContent,
        handleMarkdownChange,
        fetchQuestionById,
        handleQuestionDelete,
        currentModel,
        setCurrentModel,
        currentThread, setCurrentThread,
      }}
    >
      {children}
    </ResourceContext.Provider>
  )
}

// Custom hook to consume the resource data and any necessary methods

export const useResources = () => {
  const context = useContext(ResourceContext)

  if (!context) {
    throw new Error('useResources must be used within a ResourceProvider')
  }

  return context
}
