import { useState, useEffect } from 'react'

export function useQuestions() {
  const [questions, setQuestions] = useState([])
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Load questions from localStorage on mount
  useEffect(() => {
    const localQuestions = JSON.parse(localStorage.getItem('localQuestions'))
    if (localQuestions && localQuestions.length > 0) {
      setQuestions(localQuestions)
      setIsSubmitted(true)
    }
  }, [])

  // Save questions to localStorage whenever questions change
  useEffect(() => {
    if (questions.length > 0) {
      localStorage.setItem('localQuestions', JSON.stringify(questions))
    }
  }, [questions])

  const addQuestion = (questionText) => {
    const newQuestion = { 
      question: questionText, 
      answer: '', 
      sources: [] 
    }
    setQuestions(prev => [...prev, newQuestion])
    setIsSubmitted(true)
    return newQuestion
  }

  const updateQuestionSources = (questionIndex, sources) => {
    setQuestions(previous => {
      const updated = [...previous]
      updated[questionIndex] = { ...updated[questionIndex], sources }
      return updated
    })
  }

  const updateQuestionAnswer = (questionIndex, answer) => {
    setQuestions(previous => {
      const updated = [...previous]
      updated[questionIndex] = { ...updated[questionIndex], answer }
      localStorage.setItem('localQuestions', JSON.stringify(updated))
      localStorage.setItem('lastAttempt', new Date())
      return updated
    })
  }

  const handleLike = (question) => {
    setQuestions(previous => {
      const updated = previous.map((item) => {
        if (item.question === question.question) {
          return {
            ...item,
            like: true,
            dislike: false,
          }
        }
        return item
      })
      localStorage.setItem('localQuestions', JSON.stringify(updated))
      return updated
    })
  }

  const handleDislike = (question) => {
    setQuestions(previous => {
      const updated = previous.map((item) => {
        if (item.question === question.question) {
          return {
            ...item,
            dislike: true,
            like: false,
          }
        }
        return item
      })
      localStorage.setItem('localQuestions', JSON.stringify(updated))
      return updated
    })
  }

  const handleReport = (question, report) => {
    setQuestions(previous => {
      const updated = previous.map((item) => {
        if (item.question === question.question) {
          return {
            ...item,
            report: report,
          }
        }
        return item
      })
      localStorage.setItem('localQuestions', JSON.stringify(updated))
      return updated
    })
  }

  const clearQuestions = () => {
    localStorage.removeItem('localQuestions')
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
