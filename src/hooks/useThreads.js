import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

export function useThreads() {
  const [threads, setThreads] = useState([])
  const [currentThreadId, setCurrentThreadId] = useState(null)
  const [currentThread, setCurrentThread] = useState(null)

  // Load threads from localStorage on mount
  useEffect(() => {
    const localThreads = JSON.parse(localStorage.getItem('localThreads'))
    if (localThreads) {
      setThreads(localThreads)
    }
  }, [])

  // Update current thread when currentThreadId or threads change
  useEffect(() => {
    const thread = threads.find((thread) => thread.id === currentThreadId)
    setCurrentThread(thread)
  }, [currentThreadId, threads])

  // Save threads to localStorage whenever threads change
  useEffect(() => {
    if (threads.length > 0) {
      localStorage.setItem('localThreads', JSON.stringify(threads))
    }
  }, [threads])

  const addNewThread = () => {
    const newThread = {
      id: uuidv4(),
      date: new Date().toLocaleString(),
      name: 'New Thread',
      messages: [],
    }

    setThreads((previous) => [...previous, newThread])
    setCurrentThreadId(newThread.id)
    return newThread
  }

  const removeThread = (id) => {
    const updatedThreads = threads.filter((thread) => thread.id !== id)
    setThreads(updatedThreads)
    localStorage.setItem('localThreads', JSON.stringify(updatedThreads))
    setCurrentThreadId(null)
  }

  const updateThread = (threadId, updater) => {
    setThreads((previous) => {
      const currentThread = previous.find((thread) => thread.id === threadId)
      if (!currentThread) {
        return previous
      }

      const updatedThread = typeof updater === 'function' ? updater(currentThread) : updater
      const updatedThreads = [
        ...previous.filter((thread) => thread.id !== threadId),
        updatedThread,
      ]

      localStorage.setItem('localThreads', JSON.stringify(updatedThreads))
      return updatedThreads
    })
  }

  const addMessageToThread = (threadId, message) => {
    updateThread(threadId, (thread) => ({
      ...thread,
      messages: [...thread.messages, message],
    }))
  }

  const removeMessageFromThread = (threadId, messageContent) => {
    updateThread(threadId, (thread) => ({
      ...thread,
      messages: thread.messages.filter((msg) => msg.content !== messageContent),
    }))
  }

  const updateThreadName = (threadId, newName) => {
    updateThread(threadId, (thread) => ({
      ...thread,
      name: newName,
    }))
  }

  const clearAllThreads = () => {
    setThreads([])
    setCurrentThreadId(null)
    localStorage.removeItem('localThreads')
  }

  return {
    threads,
    currentThreadId,
    currentThread,
    setCurrentThreadId,
    addNewThread,
    removeThread,
    updateThread,
    addMessageToThread,
    removeMessageFromThread,
    updateThreadName,
    clearAllThreads,
  }
}
