import { motion } from 'framer-motion'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { Toaster } from 'react-hot-toast'

import Layout from '@/components/layout'
import { useResources } from '@/context/resources'
import { useUser } from '@/context/user'

import ModelPicker from '@/components/common/modelpicker'
import ThreadCombobox from '@/components/common/thread-combobox'
import FilterControls from '@/components/common/filter-controls'

import {
  ArrowPathIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  SquaresPlusIcon
} from '@heroicons/react/24/solid'

import LoadingIndicator, {
  LoadingCircles,
} from '@/components/common/chatloadingstate'

import InlineLoading from '@/components/InlineLoading'
import SourceCard from '@/components/common/source-card'

import { promptTemplate } from '../../utils/handleprompts/internal'

import MessageBubble from '@/components/common/message-bubble'

import { sourceFilters, typeFilters } from '../../utils/hardcoded'

import { useThreads } from '@/hooks/useThreads'
import { useInternalChatAPI } from '@/hooks/useAPI'

export default function InternalChatPage() {
  const { currentModel } = useResources()
  const { currentUser } = useUser()

  // Custom hooks
  const {
    threads,
    currentThreadId,
    currentThread,
    setCurrentThreadId,
    addNewThread,
    removeThread,
    addMessageToThread,
    removeMessageFromThread,
    updateThreadName,
    clearAllThreads,
  } = useThreads()

  const {
    isLoading,
    setIsLoading,
    currentSources,
    setCurrentSources,
    getEmbedding,
    getData,
    getCompletion,
  } = useInternalChatAPI()

  const [sideBarIsOpen, setSideBarOpen] = useState(true)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [userMessage, setUserMessage] = useState('')

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
  const handleScrollIntoView = () => {
    setTimeout(() => {
      scrollTargetRef.current.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleAddNewThread = () => {
    // prevent from creating multiple empty threads
    if (
      threads.length === 0 ||
      currentThread?.name !== 'New Thread'
    ) {
      const newThread = addNewThread()
      handleScrollIntoView()
      setSideBarOpen(false)
    }
  }

  const handleThreadRemove = (id) => {
    removeThread(id)
    setSideBarOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (userMessage.length === 0) {
      return
    }

    const threadName =
      userMessage.length > 250 ? userMessage.slice(0, 250) : userMessage

    // Update thread name if it's a new thread and add user message
    if (currentThread?.name === 'New Thread') {
      updateThreadName(currentThreadId, threadName)
    }

    addMessageToThread(currentThreadId, { role: 'user', content: userMessage })

    setIsLoading(true)
    handleScrollIntoView()

    // Create user messages array with previous user messages
    const userMessages = currentThread?.messages
      ?.filter((message) => message.role === 'user')
      ?.map((message) => message.content) || []

    const embedding = await getEmbedding(userMessage)
    console.log('embedding-------start')
    console.log(embedding)
    console.log('embedding-------end')

    const data = await getData(embedding, filterBySourceArray, filterByTypeArray)

    const sources = data.matches?.map((match) => {
      return {
        id: match.metadata.id,
        title: match.metadata.title,
        type: match.metadata.type,
        image: match.metadata.image || '',
        source: match.metadata.source,
        url: match.metadata.url,
        score: match.score,
      }
    }) || []

    setCurrentSources(sources)
    handleScrollIntoView()

    const prompt = promptTemplate(userMessage, userMessages, data.matches)
    const completion = await getCompletion(
      [...(currentThread?.messages || []), { role: 'user', content: prompt }],
      currentModel
    )

    // Add assistant message with sources
    addMessageToThread(currentThreadId, {
      role: 'assistant',
      content: completion,
      sources: sources,
    })

    setIsLoading(false)
    setIsSubmitted(true)
    setCurrentSources([])
    setUserMessage('')
    handleScrollIntoView()
  }

  return (
    <Layout>
      <Toaster />
      <div className="absolute inset-0 flex justify-center items-center opacity-10">
        <Image
          className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
          src="/logo-color.png"
          alt="Kruze Logo"
          width={100}
          height={119}
          priority
        />
      </div>
      <div className="flex flex-row justify-end items-stretch relative">
        <div
          className={`w-72 lg:w-1/4 h-screen flex flex-col bg-white border-r border-gray-200 fixed top-14 lg:top-16 left-0 z-10
          duration-500 ease-in-out transform
          ${sideBarIsOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
          style={{
            height: 'calc(100vh - 3.5rem)',
          }}
        >
          <div className="w-full">
            <button
              onClick={() => setSideBarOpen(!sideBarIsOpen)}
              className={`
                    lg:hidden
                      absolute top-2 right-0 translate-x-full z-10  text-white p-2 rounded-md
                      hover:bg-kruze-secondary
                      ${sideBarIsOpen ? 'bg-yellow-500' : 'bg-kruze-blue'}
                      `}
            >
              {sideBarIsOpen ? (
                <ChevronDoubleLeftIcon className="w-4 h-4" />
              ) : (
                <ChevronDoubleRightIcon className="w-4 h-4" />
              )}
            </button>
          </div>
          <div className="grow flex-grow relative flex flex-col justify-start items-center p-2">
            {!isSubmitted && (
              <div className="text-sm text-rose-600 p-2 rounded bg-rose-50">
                This is in development. Please provide feedback to improve the
                experience.
              </div>
            )}
            <div className=" my-3">
              <button
                onClick={handleAddNewThread}
                className="bg-kruze-blue flex items-center justify-between w-full text-white p-2 rounded-md hover:bg-kruze-secondary"
              >
                <span className="font-bold">Add new thread</span>
                <SquaresPlusIcon className="w-5 h-5 inline" />
              </button>
            </div>
            <div className="w-full mb-3">
              <p className="font-bold">Select model</p>
              <ModelPicker />
            </div>
            <div className="text-sm max-w-full mx-auto mb-3">
              Keep your questions clear and concise for the best results. Use
              single sentences or key phrases to get precise answers.
            </div>
          </div>
          <div className="flex-grow overflow-y-auto px-2 pb-4">
            <ThreadCombobox
              threads={threads}
              currentThreadId={currentThreadId}
              setCurrentThreadId={setCurrentThreadId}
            />
          </div>
        </div>

        <div
          style={{
            height: 'calc(100vh - 3.5rem)',
          }}
          className={`
          duration-500 ease-in-out transform
          flex flex-col mx-auto bg-gray-100 shadow-lg
          fixed
          ${sideBarIsOpen ? 'lg:w-3/4 w-full lg:blur-none blur-sm' : 'w-full'}
          `}
        >
          <button
            onClick={() => setSideBarOpen(!sideBarIsOpen)}
            className={`
                  hidden lg:block
                  absolute top-2 left-2 z-20  text-white p-2 rounded-md
                  hover:bg-kruze-secondary
                  ${sideBarIsOpen ? 'bg-yellow-500' : 'bg-kruze-blue'}
                  `}
          >
            {sideBarIsOpen ? (
              <ChevronDoubleLeftIcon className="w-4 h-4" />
            ) : (
              <ChevronDoubleRightIcon className="w-4 h-4" />
            )}
          </button>

          <div className="flex flex-wrap items-center justify-center pl-12 border-b border-slate-300 py-2">
            <div className="text-base lg:text-lg w-auto text-center font-semibold">
              {currentThread?.name}
            </div>
            <div className="w-auto grow text-xs lg:text-sm px-2">
              created: {currentThread?.date.toLocaleString()}
            </div>
            <div className="w-auto px-2">
              <button
                onClick={() => handleThreadRemove(currentThreadId)}
                className="bg-red-500 text-white px-1 py-0.5 rounded-md hover:bg-red-600 text-xs lg:text-sm"
              >
                Remove
              </button>
            </div>
          </div>

          <div className={`flex-grow overflow-y-auto p-0 lg:p-4 space-y-4`}>
            {/* THREADS */}
            {threads
              .filter((thread) => {
                // filter to show only current thread
                return thread.id === currentThreadId
              })
              .map((thread) => (
                <motion.div
                  key={thread.id}
                  className="w-full max-w-4xl mx-auto space-y-3 "
                  layout
                >
                  <ul className="px-1 lg:px-4 space-y-3">
                    {thread.messages.map((message, idx) => (
                      <li
                        key={idx}
                        className={`relative flex gap-2  ${
                          message.role === 'user'
                            ? 'ml-10 justify-end flex-row-reverse'
                            : 'mr-10 justify-start'
                        }`}
                      >
                        <div className={`w-auto`}>
                          {message.role === 'user' ? (
                            <div className="sticky top-24 h-8 w-8 rounded-full bg-white border border-slate-200 flex justify-center items-center relative ">
                              <Image
                                className="h-8 w-8 bg-white rounded-full sticky top-24"
                                width={32}
                                height={32}
                                src={currentUser?.image}
                                alt={currentUser?.name}
                              />
                            </div>
                          ) : message.role === 'system' ? (
                            <div className="sticky top-24 h-8 w-8 rounded-full bg-white border border-slate-200 flex justify-center items-center relative ">
                              <Image
                                className=" relative w-[62%] object-center "
                                src="/logo-color.png"
                                alt="Kruze Logo"
                                width={32}
                                height={38}
                              />
                            </div>
                          ) : (
                            <div className="sticky top-24 flex items-center justify-center ">
                              <div className="bg-white rounded-full border border-slate-200 text-xl p-1 leading-none">
                                🤖
                              </div>
                            </div>
                          )}
                        </div>
                        <div
                          className={`
                                  w-auto grow
                                  ${
                                    message.role === 'user' ? 'bg-slate-50' : ''
                                  }
                                  `}
                        >
                          <MessageBubble
                            role={message.role}
                            message={message.content}
                            onRemove={() => {
                              removeMessageFromThread(currentThreadId, message.content)
                            }}
                          />
                          {message.sources && (
                            <div
                              className="flex flex-wrap mt-2 ml-10"
                              key={`sources`}
                            >
                              <div className="leading-none font-semibold w-full mb-3">
                                Resources used:
                              </div>
                              {message.sources
                                .filter(
                                  (item, idx, arr) =>
                                    arr.findIndex((t) => t.url === item.url) ===
                                    idx
                                )
                                .map((item, idx) => (
                                  <SourceCard key={`source-${idx}`} item={item} index={idx} />
                                ))}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                    {isLoading && (
                      <li
                        className="relative flex gap-2
                              justify-start"
                      >
                        <div className="w-auto flex items-center justify-center ">
                          <div className="bg-white rounded-full border border-slate-200 text-xl p-1 leading-none">
                            🤖
                          </div>
                        </div>
                        <div className={`w-auto grow bg-white`}>
                          <div className="p-2 flex flex-col items-start justify-center h-12">
                            <LoadingCircles />
                          </div>
                        </div>
                      </li>
                    )}
                    <li>
                      <div key={'loading'} ref={scrollTargetRef}></div>
                    </li>
                  </ul>
                </motion.div>
              ))}
          </div>

          <div
            className={`
                  
                  ${currentThreadId ? '' : 'hidden'}
                  `}
          >
            {/* MOtion div with just length of sources (size)  */}
            {isLoading && (
              <div className=" z-20 w-full pb-5">
                <LoadingIndicator
                  loading={isLoading}
                  resourcesUsed={currentSources.length}
                />
              </div>
            )}
            <div className="bg-kruze-secondary md:rounded-lg z-10 md:border border-slate-200 relative max-w-4xl mx-auto">
              <div className="">
                <form
                  // onSubmit={submitMessage}
                  onSubmit={handleSubmit}
                  className="p-1 flex gap-1 text-base font-semibold leading-7 relative"
                >
                  <FilterControls
                    filterBySourceArray={filterBySourceArray}
                    setFilterBySourceArray={setFilterBySourceArray}
                    filterByTypeArray={filterByTypeArray}
                    setFilterByTypeArray={setFilterByTypeArray}
                    sourceFilters={sourceFilters}
                    typeFilters={typeFilters}
                    userRole={currentUser?.role}
                  />
                  <textarea
                    name="message"
                    onChange={(e) => {
                      setUserMessage(e.target.value)
                    }}
                    value={userMessage || ''}
                    placeholder="Enter user message..."
                    className="px-2 py-1.5 border rounded-md flex-1 font-normal focus:outline-none focus:border-gray-400"
                    rows="2"
                  />
                  <button
                    disabled={isLoading}
                    id="submit-question"
                    className={`bg-[#fd7e14] hover:bg-blue-600 delay-100 duration-500 px-2.5 rounded-md text-white relative
                          after:content-['']
                          after:absolute
                          after:opacity-0
                          after:inset-2
                          after:rounded-md
                          after:bg-blue-400
                          after:z-[0]
                          `}
                  >
                    {/* prettier-ignore */}
                    {isLoading ? (
                      <InlineLoading />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="z-10 relative"
                      >
                        <line x1="22" x2="11" y1="2" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                      </svg>
                    )}
                  </button>
                </form>
                {threads.length > 0 && (
                  <div className="px-4 py-2 relative z-10 border-t border-white">
                    <div className="flex text-xs justify-center">
                      <button
                        type="button"
                        className="border-b text-white border-white hover:border-dashed"
                        onClick={() => {
                          clearAllThreads()
                          setSideBarOpen(true)
                        }}
                      >
                        <ArrowPathIcon className="inline-block mr-2 w-3.5 h-3.5" />
                        Clear results
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
