import { createContext, useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { baseUrl, pagination as paginationConfig } from '../../utils/config'

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
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: paginationConfig.defaultPageSize,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [isInitialized, setIsInitialized] = useState(false)

  const fetchAllQuestions = async (page = 1, pageSize = paginationConfig.defaultPageSize, search = '', showSuccessToast = false) => {
    // Prevent multiple simultaneous loads
    if (loading) return
    
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      })
      
      if (search) {
        params.append('search', search)
      }
      
      const res = await fetch(`${url}?${params}`, { next: { revalidate: 86400 } })
      const response = await res.json()
      
      setAllQuestions(response.data || [])
      setPagination(response.pagination || {
        currentPage: 1,
        pageSize: paginationConfig.defaultPageSize,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      })
      
      // Mark as initialized after first successful load
      if (!isInitialized) {
        setIsInitialized(true)
      }
      
      // Only show success toast when explicitly requested (like manual refresh)
      if (showSuccessToast) {
        toast.success('Questions loaded', {
          icon: '✅',
          duration: 2500,
        })
      }
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

  const removeMultipleQuestionsById = async (ids) => {
    setLoading(true)
    try {
      const res = await fetch(url, {
        method: 'DELETE',
        headers: myHeaders,
        body: JSON.stringify({ ids }),
      })
      await res.json()

      // Refresh the current page after deletion
      await fetchAllQuestions(pagination.currentPage, pagination.pageSize, searchTerm)

      toast.success('Questions deleted', {
        icon: '🗑️',
        duration: 2500,
      })
    } catch (error) {
      console.error('Error deleting questions:', error)

      toast.error('Error deleting questions', {
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
      
      // Refresh the current page after deletion
      await fetchAllQuestions(pagination.currentPage, pagination.pageSize, searchTerm)
      
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
        removeMultipleQuestionsById,
        text,
        handleTextChange,
        markdownContent,
        handleMarkdownChange,
        fetchQuestionById,
        handleQuestionDelete,
        currentModel,
        setCurrentModel,
        currentThread,
        setCurrentThread,
        pagination,
        setPagination,
        searchTerm,
        setSearchTerm,
        isInitialized,
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
