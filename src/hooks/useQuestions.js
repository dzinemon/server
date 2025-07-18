import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'localQuestions'

export function useQuestions() {
  const [questions, setQuestions] = useState([])
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Helper function to save questions to localStorage
  const saveToStorage = useCallback((questionsToSave) => {
    if (questionsToSave.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(questionsToSave))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  // Helper function to update questions with automatic localStorage sync
  const updateQuestionsWithStorage = useCallback(
    (newQuestions) => {
      setQuestions(newQuestions)
      saveToStorage(newQuestions)
    },
    [saveToStorage]
  )

  // Load questions from localStorage on mount
  useEffect(() => {
    try {
      const localQuestions = JSON.parse(localStorage.getItem(STORAGE_KEY))
      if (localQuestions && localQuestions.length > 0) {
        setQuestions(localQuestions)
        setIsSubmitted(true)
      }
    } catch (error) {
      console.error('Error loading questions from localStorage:', error)
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  // Save questions to localStorage whenever questions change
  useEffect(() => {
    saveToStorage(questions)
  }, [questions, saveToStorage])

  const addQuestion = (questionText) => {
    const newQuestion = {
      question: questionText,
      answer: '',
      sources: [],
    }
    const newQuestions = [...questions, newQuestion]
    updateQuestionsWithStorage(newQuestions)
    setIsSubmitted(true)
    return newQuestion
  }

  const updateQuestionSources = (questionIndex, sources) => {
    setQuestions((previous) => {
      const updated = [...previous]
      updated[questionIndex] = { ...updated[questionIndex], sources }
      saveToStorage(updated)
      return updated
    })
  }

  const updateQuestionAnswer = (questionIndex, answer) => {
    setQuestions((previous) => {
      const updated = [...previous]
      updated[questionIndex] = { ...updated[questionIndex], answer }
      saveToStorage(updated)
      localStorage.setItem('lastAttempt', new Date())
      return updated
    })
  }

  // Helper function to update question properties
  const updateQuestionProperty = useCallback(
    (questionText, property, value) => {
      setQuestions((previous) => {
        const updated = previous.map((item) => {
          if (item.question === questionText) {
            return { ...item, [property]: value }
          }
          return item
        })
        saveToStorage(updated)
        return updated
      })
    },
    [saveToStorage]
  )

  const handleLike = (question) => {
    updateQuestionProperty(question.question, 'like', true)
    updateQuestionProperty(question.question, 'dislike', false)
  }

  const handleDislike = (question) => {
    updateQuestionProperty(question.question, 'dislike', true)
    updateQuestionProperty(question.question, 'like', false)
  }

  const handleReport = (question, report) => {
    updateQuestionProperty(question.question, 'report', report)
  }

  const clearQuestions = () => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem('lastAttempt')
    setIsSubmitted(false)
    setQuestions([])
  }

  return {
    questions,
    isSubmitted,
    addQuestion,
    updateQuestionSources,
    updateQuestionAnswer,
    handleLike,
    handleDislike,
    handleReport,
    clearQuestions,
  }
}
