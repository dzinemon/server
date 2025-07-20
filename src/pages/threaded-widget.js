import Image from 'next/image'
import {
  lazy,
  memo,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { v4 as uuidv4 } from 'uuid'

import {
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
  ArrowUpIcon,
  TrashIcon,
} from '@heroicons/react/24/solid'

import ModelPicker from '@/components/common/modelpicker'

import LoadingIndicator from '@/components/common/chatloadingstate'

// Lazy load MessageBubble since it now contains heavy markdown processing
const MessageBubble = lazy(() => import('@/components/common/message-bubble'))

// Lazy load components that are conditionally rendered
const SourceCardCompact = lazy(() =>
  import('@/components/common/source-card-compact')
)

import Layout from '@/components/layout'

import { promptTemplate } from '../../utils/handleprompts/internal'
import { sourceFilters, typeFilters } from '../../utils/hardcoded'
import { useInternalChatAPI } from '../hooks/useAPI'

import {
  categories,
  WelcomeMessages,
} from '@/components/common/WelcomeMessages'

// Lazy load the welcome screen component
const WelcomeScreen = lazy(() =>
  Promise.resolve({
    default: memo(function WelcomeScreen({
      questionExamples,
      onQuestionClick,
    }) {
      return (
        <div className="flex-1 flex items-center justify-start p-8">
          <div className="w-full max-w-4xl mx-auto">
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
              Kruze AI Chat Assistant
            </h2>
            <WelcomeMessages
              categories={questionExamples}
              onMessageClick={onQuestionClick}
            />
          </div>
        </div>
      )
    }),
  })
)

// Lazy load sources section
const MessageSources = lazy(() =>
  Promise.resolve({
    default: memo(function MessageSources({ sources }) {
      return (
        <div className="flex flex-wrap ml-0 gap-2">
          <div className="leading-none font-semibold w-full mb-3 text-sm text-gray-700">
            Resources used:
          </div>
          {sources
            .filter(
              (item, idx, arr) =>
                arr.findIndex((t) => t.url === item.url) === idx
            )
            .map((item, idx) => (
              <Suspense
                key={`source-${idx}`}
                fallback={
                  <div className="w-16 h-8 bg-gray-100 rounded animate-pulse" />
                }
              >
                <SourceCardCompact item={item} index={idx} />
              </Suspense>
            ))}
        </div>
      )
    }),
  })
)

// Memoized ThreadCombobox component
const ThreadCombobox = memo(function ThreadCombobox({
  threads,
  currentThreadId,
  setCurrentThreadId,
  handleThreadRemove,
}) {
  const [query, setQuery] = useState('')

  // Memoize filtered threads to prevent recalculation on every render
  const filteredThreads = useMemo(() => {
    if (query === '') return threads
    return threads.filter((thread) => {
      return thread.name.toLowerCase().includes(query.toLowerCase())
    })
  }, [threads, query])

  //

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

  // Memoize thread removal handler
  const handleRemoveClick = useCallback(
    (e, threadId) => {
      e.stopPropagation() // Prevent thread selection when clicking remove
      handleThreadRemove(threadId)
    },
    [handleThreadRemove]
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
      <div className="flex flex-col divide-y border rounded-lg max-h-70vh overflow-y-auto">
        {filteredThreads.map((thread, idx, arr) => (
          <div
            key={thread.id}
            className={`relative group ${
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
            hover:bg-blue-50 hover:text-blue-600`}
          >
            <button
              onClick={() => handleThreadSelect(thread.id)}
              className="w-full p-2 text-left leading-tight text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-inset rounded-inherit"
              title={thread.name}
            >
              <div className="truncate pr-8">{thread.name}</div>
              <div className="text-xs text-gray-400 mt-0.5 leading-none">
                {new Date(thread.date).toLocaleDateString()}
              </div>
            </button>

            {/* Remove button - appears on hover */}
            <button
              onClick={(e) => handleRemoveClick(e, thread.id)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-all duration-200 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-300"
              title="Delete conversation"
              aria-label={`Delete conversation: ${thread.name}`}
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
})
export default function ThreadedChatWidget() {
  const [sideBarIsOpen, setSideBarOpen] = useState(true)
  const [userMessage, setUserMessage] = useState('')
  const [threads, setThreads] = useState([])
  const [currentThreadId, setCurrentThreadId] = useState(null)

  // Use the hook
  const {
    isLoading,
    setIsLoading,
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

  const drawerRef = useRef(null)

  const handleOutsideClick = useCallback(
    (e) => {
      if (drawerRef.current && e.target == drawerRef.current && sideBarIsOpen) {
        setSideBarOpen(false)
      }
    },
    [sideBarIsOpen]
  )

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
    // Check if there's already a "New Conversation" thread without messages
    const existingNewThread = threads.find(
      (thread) =>
        thread.name === 'New Conversation' && thread.messages.length === 0
    )

    // If an empty "New Conversation" already exists, just select it
    if (existingNewThread) {
      setCurrentThreadId(existingNewThread.id)
      setSideBarOpen(false)

      // Focus on input
      setTimeout(() => {
        if (messageInputRef.current) {
          messageInputRef.current.focus()
        }
      }, 300)
      return
    }

    // Create new thread only if no empty "New Conversation" exists
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

  // Add event listener for outside clicks to close sidebar
  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [handleOutsideClick])

  return (
    <Layout hasNavar={false}>
      <div className="h-screen bg-gray-50 flex flex-col">
        <Toaster position="top-center" />

        <div
          className={`absolute left-2 rounded-lg top-2 p-1 z-10 ${
            sideBarIsOpen ? '' : 'bg-blue-50'
          }`}
        >
          <button
            onClick={handleSidebarToggle}
            className="p-2 rounded-md hover:bg-white hover:text-blue-600  text-gray-600"
          >
            {sideBarIsOpen ? (
              <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            ) : (
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden bg-blue-50/50">
          {sideBarIsOpen && (
            <div
              ref={drawerRef}
              className="block md:hidden absolute inset-0 bg-gray-500/60 backdrop-blur-lg z-[1]"
            />
          )}
          {/* Sidebar - remains the same */}
          <div
            className={`flex flex-col transition-all duration-100 ease-in-out 
              absolute md:shadow-none bg-white md:bg-transparent md:static left-0 top-0 bottom-0 z-[1]
               ${sideBarIsOpen ? 'w-80 shadow-lg ' : 'w-0'} overflow-hidden
            `}
          >
            <div className="px-4 pt-16 flex items-center justify-between">
              <div className="flex items-center justify-center w-full">
                <Image
                  src="/logo-color.png"
                  alt="Logo"
                  width={23}
                  height={27}
                  className="object-contain"
                />
                <h1 className="text-lg font-semibold text-gray-900 text-center">
                  AI Chat Assistant
                </h1>
              </div>
            </div>

            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
              <button
                onClick={handleAddNewThread}
                className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2 text-sm font-medium bg-gradient-to-b from-blue-600 via-blue-700 to-blue-600"
              >
                <span>New Conversation</span>
              </button>
              <ThreadCombobox
                threads={threads}
                currentThreadId={currentThreadId}
                setCurrentThreadId={setCurrentThreadId}
                handleThreadRemove={handleThreadRemove}
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
          <div
            className={`relative
              ${
                sideBarIsOpen
                  ? 'w-[calc(100%-20rem)] mt-0 md:mt-4 border border-blue-100 rounded-tl-lg shadow-lg'
                  : 'w-full'
              }
              flex-1 flex flex-col bg-white
            `}
          >
            {currentThread && currentThread.messages.length > 0 ? (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
                  {currentThread.messages.map((message, idx) => (
                    <div
                      key={idx}
                      className={`mx-auto max-w-5xl flex gap-3 ${
                        message.role === 'user'
                          ? 'justify-end'
                          : 'justify-start'
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
                        <Suspense
                          fallback={
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                              <div className="animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                              </div>
                            </div>
                          }
                        >
                          <MessageBubble
                            role={message.role}
                            message={message.content}
                            className={
                              message.role === 'user'
                                ? 'text-slate-800'
                                : 'text-gray-900'
                            }
                          />
                        </Suspense>
                        {message.sources && message.sources.length > 0 && (
                          <Suspense
                            fallback={
                              <div className="flex gap-2 mt-2">
                                <div className="text-sm text-gray-700">
                                  Loading sources...
                                </div>
                              </div>
                            }
                          >
                            <MessageSources sources={message.sources} />
                          </Suspense>
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
                    <div className="mx-auto max-w-5xl flex justify-start gap-3">
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
              // Welcome Screen with Suspense
              <Suspense
                fallback={
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-gray-500">Loading...</div>
                  </div>
                }
              >
                <WelcomeScreen
                  questionExamples={categories}
                  onQuestionClick={handleQuestionClick}
                />
              </Suspense>
            )}
            {/* Input Area - remains the same */}
            <div className="absolute bottom-0 w-full left-0 right-0">
              <div className="shadow-2xl border-t-[8px] border-x-[8px] border-blue-50/90 rounded-t-2xl max-w-3xl mx-auto w-full relative">
                <form onSubmit={handleSubmit} className="flex">
                  <input
                    ref={messageInputRef}
                    type="text"
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    placeholder="Type your message..."
                    name="user message"
                    className="flex-1 px-2 pt-2 pb-16 rounded-t-lg active:bg-white focus:bg-white backdrop-blur-md bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent text-gray-600"
                    disabled={isLoading}
                  />
                  <div className="absolute bottom-2 left-2 w-40">
                    <ModelPicker />
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <button
                      type="submit"
                      disabled={isLoading || !userMessage.trim()}
                      className={`px-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center
                        ${userMessage}
                        `}
                    >
                      <ArrowUpIcon className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
