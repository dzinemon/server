import Image from 'next/image'
import { useRouter } from 'next/router'
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  memo,
} from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { v4 as uuidv4 } from 'uuid'

import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  PaperAirplaneIcon,
  SquaresPlusIcon,
  TrashIcon,
} from '@heroicons/react/24/solid'

import LoadingIndicator from '@/components/common/chatloadingstate'
import MessageBubble from '@/components/common/message-bubble'
import SourceCardCompact from '@/components/common/source-card-compact'
import { promptTemplate } from '../../utils/handleprompts/internal'
import { sourceFilters, typeFilters } from '../../utils/hardcoded'
import { useInternalChatAPI } from '../hooks/useAPI'

const questionExamples = [
  'Is QuickBooks good for SaaS Startups?',
  'What is the best accounting software for SaaS startups?',
  'What taxes should I pay as a Delaware C-corp startup?',
  'How much time do you spend monthly doing bookkeeping?',
  'Who are good bookkeepers in Mountain View CA?',
  'Which tools should every startup CFO know/use?',
]

// Memoized ThreadCombobox component
const ThreadCombobox = memo(function ThreadCombobox({
  threads,
  currentThreadId,
  setCurrentThreadId,
}) {
  const [query, setQuery] = useState('')

  // Memoize filtered threads to prevent recalculation on every render
  const filteredThreads = useMemo(() => {
    if (query === '') return threads
    return threads.filter((thread) => {
      return thread.name.toLowerCase().includes(query.toLowerCase())
    })
  }, [threads, query])

  // Memoize query change handler
  const handleQueryChange = useCallback((e) => {
    setQuery(e.target.value)
  }, [])

  // Memoize thread selection handler
  const handleThreadSelect = useCallback(
    (threadId) => {
      setCurrentThreadId(threadId)
    },
    [setCurrentThreadId]
  )

  return (
    <div className="space-y-3 w-full">
      <div>
        <div className="flex flex-row items-stretch gap-2 justify-between">
          {threads.length > 0 && (
            <div className="grow">
              <p className="font-bold text-sm">Conversations</p>
              <input
                type="text"
                value={query}
                onChange={handleQueryChange}
                placeholder="🔎 Search conversations"
                className="px-2 w-full py-1.5 border rounded-md flex-1 font-normal focus:outline-none focus:border-gray-400 text-sm"
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col divide-y border rounded-lg max-h-48 overflow-y-auto">
        {filteredThreads.map((thread, idx, arr) => (
          <button
            key={thread.id}
            onClick={() => handleThreadSelect(thread.id)}
            className={`${
              thread.id === currentThreadId
                ? 'bg-blue-50 text-blue-600'
                : 'bg-white text-gray-700'
            }
            ${
              idx === 0
                ? 'rounded-t-md'
                : idx === arr.length - 1
                ? 'rounded-b-md'
                : ''
            }
            ${arr.length === 1 ? 'rounded-b-md' : ''}
            ${idx !== 0 && idx !== arr.length - 1 ? 'rounded-none' : ''}
            p-2 hover:bg-blue-50 hover:text-blue-600 text-left leading-tight text-sm`}
          >
            <div className="truncate">{thread.name}</div>
            <div className="text-xs text-gray-400 mt-1">
              {new Date(thread.date).toLocaleDateString()}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
})

export default function ThreadedChatWidget() {
  const router = useRouter()
  const [sideBarIsOpen, setSideBarOpen] = useState(true)
  const [userMessage, setUserMessage] = useState('')
  const [threads, setThreads] = useState([])
  const [currentThreadId, setCurrentThreadId] = useState(null)

  // Use the hook
  const {
    isLoading,
    setIsLoading,
    currentSources,
    setCurrentSources,
    getEmbedding,
    getData,
    getCompletion,
  } = useInternalChatAPI()

  // Add filter states for RAG
  const [filterBySourceArray, setFilterBySourceArray] = useState([
    sourceFilters[0],
    sourceFilters[1],
    sourceFilters[2],
  ])

  const [filterByTypeArray, setFilterByTypeArray] = useState([
    typeFilters[0],
    typeFilters[1],
    typeFilters[2],
    typeFilters[3],
    typeFilters[4],
    typeFilters[5],
  ])

  const scrollTargetRef = useRef(null)
  const messageInputRef = useRef(null)

  // Memoize current thread calculation
  const currentThread = useMemo(() => {
    return threads.find((thread) => thread.id === currentThreadId) || null
  }, [threads, currentThreadId])

  // Memoize scroll handler
  const handleScrollIntoView = useCallback(() => {
    setTimeout(() => {
      if (scrollTargetRef.current) {
        scrollTargetRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }, [])

  // Memoize parent notification function
  const notifyParentOfThreadCount = useCallback((count) => {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          type: 'THREAD_COUNT_UPDATE',
          count: count,
        },
        '*'
      )
    }
  }, [])

  // Memoize add new thread handler
  const handleAddNewThread = useCallback(() => {
    const newThread = {
      id: uuidv4(),
      date: new Date().toISOString(),
      name: 'New Conversation',
      messages: [],
    }

    const updatedThreads = [...threads, newThread]
    setThreads(updatedThreads)
    setCurrentThreadId(newThread.id)
    localStorage.setItem('threadedChatThreads', JSON.stringify(updatedThreads))
    notifyParentOfThreadCount(updatedThreads.length)
    handleScrollIntoView()
    setSideBarOpen(false)

    // Focus on input
    setTimeout(() => {
      if (messageInputRef.current) {
        messageInputRef.current.focus()
      }
    }, 300)
  }, [threads, notifyParentOfThreadCount, handleScrollIntoView])

  // Memoize thread removal handler
  const handleThreadRemove = useCallback(
    (id) => {
      const updatedThreads = threads.filter((thread) => thread.id !== id)
      setThreads(updatedThreads)
      localStorage.setItem(
        'threadedChatThreads',
        JSON.stringify(updatedThreads)
      )
      notifyParentOfThreadCount(updatedThreads.length)
      setCurrentThreadId(null)
      setSideBarOpen(true)
    },
    [threads, notifyParentOfThreadCount]
  )

  const askQuestion = useCallback(
    async (question, userMessages, currentThreadMessages) => {
      try {
        // Get embedding for the question
        const embedding = await getEmbedding(question)
        console.log('embedding generated')

        // Get relevant data from vector database
        const data = await getData(
          embedding,
          filterBySourceArray,
          filterByTypeArray
        )
        console.log('data retrieved')

        // Extract sources for display
        const sources = data.matches
          ? data.matches.map((match) => {
              return {
                id: match.metadata.id,
                title: match.metadata.title,
                type: match.metadata.type,
                image: match.metadata.image || '',
                source: match.metadata.source,
                url: match.metadata.url,
                score: match.score,
              }
            })
          : []

        setCurrentSources(sources)

        // Create prompt using the template
        const prompt = promptTemplate(
          question,
          userMessages,
          data.matches || []
        )

        // Get completion using the hook
        const completion = await getCompletion([
          ...currentThreadMessages,
          { role: 'user', content: prompt },
        ])

        return {
          completion: completion,
          sources: sources,
        }
      } catch (error) {
        console.error('Error asking question:', error)
        return {
          completion: 'Sorry, there was an error processing your question.',
          sources: [],
        }
      }
    },
    [
      getEmbedding,
      getData,
      getCompletion,
      filterBySourceArray,
      filterByTypeArray,
      setCurrentSources,
    ]
  )

  // Memoize submit handler
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()

      if (userMessage.trim().length === 0) {
        return
      }

      // Create a new thread if none exists
      let targetThreadId = currentThreadId
      if (!targetThreadId) {
        const newThread = {
          id: uuidv4(),
          date: new Date().toISOString(),
          name:
            userMessage.length > 50
              ? userMessage.slice(0, 50) + '...'
              : userMessage,
          messages: [],
        }
        const updatedThreads = [...threads, newThread]
        setThreads(updatedThreads)
        targetThreadId = newThread.id
        setCurrentThreadId(targetThreadId)
        localStorage.setItem(
          'threadedChatThreads',
          JSON.stringify(updatedThreads)
        )
        notifyParentOfThreadCount(updatedThreads.length)
      }

      const threadName =
        userMessage.length > 50 ? userMessage.slice(0, 50) + '...' : userMessage

      // Add user message to thread
      setThreads((previous) => {
        const currentThread = previous.find(
          (thread) => thread.id === targetThreadId
        )

        if (!currentThread) {
          return previous
        }

        const updatedThreads = [
          ...previous.filter((thread) => thread.id !== targetThreadId),
          {
            ...currentThread,
            name:
              currentThread.name === 'New Conversation'
                ? threadName
                : currentThread.name,
            messages: [
              ...currentThread.messages,
              { role: 'user', content: userMessage },
            ],
          },
        ]

        localStorage.setItem(
          'threadedChatThreads',
          JSON.stringify(updatedThreads)
        )
        return updatedThreads
      })

      setIsLoading(true)
      setUserMessage('')
      handleScrollIntoView()

      try {
        // Get current thread to pass existing messages
        const currentThread = threads.find(
          (thread) => thread.id === targetThreadId
        )

        // Create user messages array with previous user messages
        const userMessages = currentThread
          ? currentThread.messages
              .filter((message) => message.role === 'user')
              .map((message) => message.content)
          : []

        const { completion, sources } = await askQuestion(
          userMessage,
          userMessages,
          currentThread ? currentThread.messages : []
        )

        // Add assistant response to thread with sources
        setThreads((previous) => {
          const currentThread = previous.find(
            (thread) => thread.id === targetThreadId
          )

          if (!currentThread) {
            return previous
          }

          const updatedThreads = [
            ...previous.filter((thread) => thread.id !== targetThreadId),
            {
              ...currentThread,
              messages: [
                ...currentThread.messages,
                { role: 'assistant', content: completion, sources: sources },
              ],
            },
          ]

          localStorage.setItem(
            'threadedChatThreads',
            JSON.stringify(updatedThreads)
          )
          return updatedThreads
        })
      } catch (error) {
        console.error('Error in handleSubmit:', error)
        toast.error('Failed to send message')
      }

      setIsLoading(false)
      setCurrentSources([])
      handleScrollIntoView()
    },
    [
      userMessage,
      currentThreadId,
      threads,
      notifyParentOfThreadCount,
      handleScrollIntoView,
      askQuestion,
      setIsLoading,
      setCurrentSources,
    ]
  )

  // Memoize question click handler
  const handleQuestionClick = useCallback((question) => {
    setUserMessage(question)
    if (messageInputRef.current) {
      messageInputRef.current.focus()
    }
  }, [])

  // Memoize sidebar toggle handler
  const handleSidebarToggle = useCallback(() => {
    setSideBarOpen(!sideBarIsOpen)
  }, [sideBarIsOpen])

  // Load threads from localStorage on mount
  useEffect(() => {
    try {
      const localThreads = JSON.parse(
        localStorage.getItem('threadedChatThreads') || '[]'
      )
      if (localThreads.length > 0) {
        setThreads(localThreads)
        notifyParentOfThreadCount(localThreads.length)
      }
    } catch (error) {
      console.error('Error loading threads from localStorage:', error)
    }

    // Check for predefined question from sessionStorage
    const predefinedQuestion = sessionStorage.getItem('threadedChatQuestion')
    if (predefinedQuestion) {
      setUserMessage(predefinedQuestion)
      sessionStorage.removeItem('threadedChatQuestion')
      setTimeout(() => {
        if (messageInputRef.current) {
          messageInputRef.current.focus()
        }
      }, 500)
    }
  }, [notifyParentOfThreadCount])

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Image
            src="/logo-color.png"
            alt="Logo"
            width={32}
            height={38}
            className="object-contain"
          />
          <h1 className="text-lg font-semibold text-gray-900">
            AI Chat Assistant
          </h1>
        </div>
        <button
          onClick={handleSidebarToggle}
          className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
        >
          {sideBarIsOpen ? (
            <ChevronDoubleLeftIcon className="w-5 h-5" />
          ) : (
            <ChevronDoubleRightIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out ${
            sideBarIsOpen ? 'w-80' : 'w-0'
          } overflow-hidden`}
        >
          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            <button
              onClick={handleAddNewThread}
              className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2 text-sm font-medium"
            >
              <SquaresPlusIcon className="w-4 h-4" />
              <span>New Conversation</span>
            </button>

            <ThreadCombobox
              threads={threads}
              currentThreadId={currentThreadId}
              setCurrentThreadId={setCurrentThreadId}
            />

            {threads.length === 0 && (
              <div className="text-center text-gray-500 text-sm mt-8">
                <p>No conversations yet.</p>
                <p>Start a new conversation to begin!</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {currentThread ? (
            <>
              {/* Thread Header */}
              <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900 truncate">
                    {currentThread.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(currentThread.date).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleThreadRemove(currentThreadId)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Delete conversation"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentThread.messages.map((message, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          🤖
                        </div>
                      </div>
                    )}
                    <div className="flex-1">
                      <MessageBubble
                        role={message.role}
                        message={message.content}
                        className={
                          message.role === 'user'
                            ? 'text-slate-800'
                            : 'text-gray-900'
                        }
                      />
                      {message.sources && message.sources.length > 0 && (
                        <div className="flex flex-wrap  ml-0 gap-2">
                          <div className="leading-none font-semibold w-full mb-3 text-sm text-gray-700">
                            Resources used:
                          </div>
                          {message.sources
                            .filter(
                              (item, idx, arr) =>
                                arr.findIndex((t) => t.url === item.url) === idx
                            )
                            .map((item, idx) => (
                              <SourceCardCompact
                                key={`source-${idx}`}
                                item={item}
                                index={idx}
                              />
                            ))}
                        </div>
                      )}
                    </div>
                    {message.role === 'user' && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          👤
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        🤖
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <LoadingIndicator />
                    </div>
                  </div>
                )}

                <div ref={scrollTargetRef} />
              </div>
            </>
          ) : (
            // Welcome Screen
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="mb-6">
                  <Image
                    src="/logo-color.png"
                    alt="Logo"
                    width={64}
                    height={76}
                    className="mx-auto object-contain opacity-50"
                  />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Welcome to AI Chat
                </h2>
                <p className="text-gray-600 mb-6">
                  Start a conversation by creating a new thread or selecting
                  from example questions below.
                </p>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Try asking:
                  </p>
                  {questionExamples.slice(0, 3).map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuestionClick(question)}
                      className="block w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="bg-white border-t border-gray-200 p-4">
            <form onSubmit={handleSubmit} className="flex space-x-3">
              <input
                ref={messageInputRef}
                type="text"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !userMessage.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
