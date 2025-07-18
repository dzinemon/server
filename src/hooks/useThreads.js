import { useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'localThreads'

export function useThreads() {
  const [threads, setThreads] = useState([])
  const [currentThreadId, setCurrentThreadId] = useState(null)
  const [currentThread, setCurrentThread] = useState(null)

  // Helper function to save threads to localStorage
  const saveToStorage = useCallback((threadsToSave) => {
    if (threadsToSave.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(threadsToSave))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  // Helper function to update threads with automatic localStorage sync
  const updateThreadsWithStorage = useCallback(
    (newThreads) => {
      setThreads(newThreads)
      saveToStorage(newThreads)
    },
    [saveToStorage]
  )

  // Load threads from localStorage on mount
  useEffect(() => {
    try {
      const localThreads = JSON.parse(localStorage.getItem(STORAGE_KEY))
      if (localThreads && Array.isArray(localThreads)) {
        setThreads(localThreads)
      }
    } catch (error) {
      console.error('Error loading threads from localStorage:', error)
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  // Update current thread when currentThreadId or threads change
  useEffect(() => {
    const thread = threads.find((thread) => thread.id === currentThreadId)
    setCurrentThread(thread || null)
  }, [currentThreadId, threads])

  // Save threads to localStorage whenever threads change
  useEffect(() => {
    saveToStorage(threads)
  }, [threads, saveToStorage])

  const addNewThread = () => {
    const newThread = {
      id: uuidv4(),
      date: new Date().toLocaleString(),
      name: 'New Thread',
      messages: [],
    }

    const newThreads = [...threads, newThread]
    updateThreadsWithStorage(newThreads)
    setCurrentThreadId(newThread.id)
    return newThread
  }

  const removeThread = (id) => {
    const updatedThreads = threads.filter((thread) => thread.id !== id)
    updateThreadsWithStorage(updatedThreads)

    // Reset current thread if it was the one being removed
    if (currentThreadId === id) {
      setCurrentThreadId(null)
    }
  }

  const updateThread = (threadId, updater) => {
    setThreads((previous) => {
      const currentThread = previous.find((thread) => thread.id === threadId)
      if (!currentThread) {
        return previous
      }

      const updatedThread =
        typeof updater === 'function' ? updater(currentThread) : updater
      const updatedThreads = [
        ...previous.filter((thread) => thread.id !== threadId),
        updatedThread,
      ]

      // Save to localStorage immediately for thread updates
      saveToStorage(updatedThreads)
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
    localStorage.removeItem(STORAGE_KEY)
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
