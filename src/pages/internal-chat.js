import React, { Fragment, useRef, useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import toast, { Toaster } from 'react-hot-toast'
import { v4 as uuidv4 } from 'uuid'

import Layout from '@/components/layout'
import { useResources } from '@/context/resources'
import { useUser } from '@/context/user'

import {
  ArrowPathIcon,
  FunnelIcon,
  CheckIcon,
  ChevronUpDownIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/solid'
import { Type } from '@/components/question-list-item'

import LoadingIndicator, {
  LoadingCircles,
} from '@/components/common/chatloadingstate'

import InlineLoading from '@/components/InlineLoading'

import { Listbox, Combobox, Transition } from '@headlessui/react'

import { promptTemplate } from '../../utils/handleprompts/internal'

import MessageBubble from '@/components/common/message-bubble'

import {
  sourceFilters,
  typeFilters,
} from '../../utils/hardcoded'

function ThreadCombobox({ threads, currentThreadId, setCurrentThreadId }) {
  // const [selectedthread, setSelectedthread] = useState(people[0])
  const [query, setQuery] = useState('')

  const filteredThreads =
    query === ''
      ? threads
      : threads.filter((thread) => {
          return thread.name.toLowerCase().includes(query.toLowerCase())
        })

  return (
    <Combobox
      value={threads.find((thread) => thread.id === currentThreadId)}
      onChange={(thread) => setCurrentThreadId(thread.id)}
    >
      <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
        <Combobox.Input
          className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
          displayValue={(thread) => thread.name}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronUpDownIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </Combobox.Button>
      </div>

      <Transition
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery('')}
        >
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
            {threads.length === 0 && (
              <span>
                {' '}
                Please Add new Thread and submit your first message to start the
                thread{' '}
              </span>
            )}

            {filteredThreads.length === 0 && query !== '' ? (
              <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                Nothing found.
              </div>
            ) : (
              filteredThreads.map((thread) => (
                <Combobox.Option
                  key={thread.id}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active
                        ? 'bg-kruze-blue text-white'
                        : 'text-kruze-secondary'
                    }`
                  }
                  value={thread}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {thread.name}
                      </span>
                      {selected ? (
                        <span
                          className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                            active ? 'text-white' : 'text-kruze-blue'
                          }`}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </Transition>
    </Combobox>
  )
}

export default function InternalChatPage() {
  const { currentModel } = useResources()

  const { currentUser } = useUser()

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

  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [userMessage, setUserMessage] = useState('')
  const [threads, setThreads] = useState([])
  const [currentThreadId, setCurrentThreadId] = useState(null)

  const [currentSources, setCurrentSources] = useState([])

  const myHeaders = new Headers()
  myHeaders.append('Content-Type', 'application/json')

  const handleAddNewThread = () => {
    const newThread = {
      id: uuidv4(),
      date: new Date().toLocaleString(),
      name: 'New Thread',
      messages: [],
    }

    setThreads((previous) => [...previous, newThread])
    setCurrentThreadId(newThread.id)
    handleScrollIntoView()
  }

  const handleThreadRemove = (id) => {
    const updatedThreads = threads.filter((thread) => thread.id !== id)
    setThreads(updatedThreads)
    // update local storage
    localStorage.setItem('localThreads', JSON.stringify(updatedThreads))
    setCurrentThreadId(null)
  }

  const getEmbedding = async (question) => {
    const questionRequestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        question: question,
      }),
      redirect: 'follow', // manual, *follow, error
    }

    const { embedding } = await fetch(
      '/api/v1/generateembedding',
      questionRequestOptions
    )
      .then((response) => {
        if (response.status === 200) {
          console.log('post success')
          console.log(response)
          toast('Embedding generated', {
            icon: '🚀',
            duration: 2000,
          })
        }
        return response.json()
      })
      .then((result) => result)
      .catch((error) => {
        console.log('error', error)
        toast('Error generating embedding', {
          icon: '❌',
        })
        return { embedding: '' }
      })

    return embedding
  }

  const getData = async (embedding) => {
    const questionRequestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        embedding: embedding,
        sourceFilters: filterBySourceArray,
        typeFilters: filterByTypeArray,
        topK: 4,
      }),
      redirect: 'follow', // manual, *follow, error
    }

    const { data } = await fetch(
      '/api/v1/queryembedding',
      questionRequestOptions
    )
      .then((response) => {
        if (response.status === 200) {
          console.log('post success')
          console.log(response)
          toast('Data fetched', {
            icon: '🚀',
            duration: 2000,
          })
        }
        return response.json()
      })
      .then((result) => result)
      .catch((error) => {
        console.log('error', error)
        toast('Error generating completion', {
          icon: '❌',
        })
        return { data: [] }
      })

    return data
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (userMessage.length === 0) {
      return
    }

    // get current thread and update the name to the user message

    const newThread = threads.find((thread) => thread.id === currentThreadId)

    const threadName =
      userMessage.length > 250 ? userMessage.slice(0, 250) : userMessage

    setThreads((previous) => {
      const currentThread = previous.find(
        (thread) => thread.id === currentThreadId
      )

      if (!currentThread) {
        return previous
      }

      const updatedThreads = [
        ...previous.filter((thread) => thread.id !== currentThreadId),
        {
          ...currentThread,
          name:
            currentThread.name === 'New Thread'
              ? threadName
              : currentThread.name,
          messages: [
            ...currentThread.messages,
            { role: 'user', content: userMessage },
          ],
        },
      ]

      // Save to localStorage
      localStorage.setItem('localThreads', JSON.stringify(updatedThreads))

      return updatedThreads
    })

    setIsLoading(true)
    handleScrollIntoView()

    // create user messages array with the only previous user messages if they exist

    const userMessages = threads
      .filter((thread) => thread.id === currentThreadId)
      .map((thread) => {
        return thread.messages
          .filter((message) => message.role === 'user')
          .map((message) => message.content)
      })

    const embedding = await getEmbedding(userMessage)

    console.log('embedding-------start')
    console.log(embedding)
    console.log('embedding-------end')

    const data = await getData(embedding)

    const sources = await data.matches.map((match) => {
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
    // .filter(
    //   (item, idx, arr) => arr.findIndex((t) => t.url === item.url) === idx
    // )

    setCurrentSources(sources)

    handleScrollIntoView()

    console.log('data-------start')
    console.log(data)
    console.log('data-------end')

    const prompt = promptTemplate(userMessage, userMessages, data.matches)

    console.log('prompt-------start')
    console.log(prompt)
    console.log('prompt-------end')

    const completionResponse = await fetch('/api/openai/messages', {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        messages: [...newThread.messages, { role: 'user', content: prompt }],
        model: currentModel,
        temperature: 0.1,
      }),
      redirect: 'follow', // manual, *follow, error
    })
      .then((response) => {
        if (response.status === 200) {
          console.log('post success')
          console.log(response)
        }
        return response.json()
      })
      .then((result) => result)
      .catch((error) => {
        console.log('error', error)
        toast('Error generating completion', {
          icon: '❌',
        })
        return { completion: '' }
      })

    const { completion } = completionResponse

    console.log('completion-------start')
    console.log(completion)
    console.log('completion-------end')

    // update the current thread with the sources and completion as the assistant message

    setThreads((previous) => {
      const currentThread = previous.find(
        (thread) => thread.id === currentThreadId
      )

      if (!currentThread) {
        return previous
      }

      const updatedThreads = [
        ...previous.filter((thread) => thread.id !== currentThreadId),
        {
          ...currentThread,
          messages: [
            ...currentThread.messages,
            { role: 'assistant', content: completion, sources: sources },
          ],
        },
      ]

      // Save to localStorage
      localStorage.setItem('localThreads', JSON.stringify(updatedThreads))

      return updatedThreads
    })

    setIsLoading(false)
    setIsSubmitted(true)
    setCurrentSources([])

    setUserMessage('')

    handleScrollIntoView()
  }

  useEffect(() => {
    const localThreads = JSON.parse(localStorage.getItem('localThreads'))

    if (localThreads) {
      setThreads(localThreads)
    }
  }, [])

  return (
    <Layout>
      <div className="flex flex-col items-end justify-center relative">
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
        <div className="relative overflow-auto pb-40 w-full max-w-4xl mx-auto flex flex-col justify-start items-center">
          <motion.div
            className={` w-full overflow-auto space-y-3 lg:space-y-4 px-4 `}
            layout
          >
            {/* THREADS */}
            <div className="border-kruze-blue border-2 rounded-lg p-2">
              {!isSubmitted && (
                <div className="text-sm text-rose-600 text-center">
                  This is in development. Please provide feedback to improve the
                  experience.
                </div>
              )}
              <div className="text-center my-3">
                <button
                  onClick={() => {
                    // prevent from creating multiple empty threads and if current thread name is not new thread
                    if (
                      threads.length === 0 ||
                      threads.find((thread) => thread.id === currentThreadId)
                        ?.name !== 'New Thread'
                    ) {
                      handleAddNewThread()
                    }
                  }}
                  className="bg-kruze-blue text-white p-2 rounded-md hover:bg-kruze-secondary"
                >
                  Add new thread
                </button>
              </div>
              <div className="text-center text-sm px-4 max-w-full mx-auto my-3">
                Keep your questions clear and concise for the best results. Use
                single sentences or key phrases to get precise answers.
              </div>

              <ThreadCombobox
                threads={threads}
                currentThreadId={currentThreadId}
                setCurrentThreadId={setCurrentThreadId}
              />
            </div>

            {/* THREADS */}

            {threads
              .filter((thread) => {
                // filter to show only current thread
                return thread.id === currentThreadId
              })
              .map((thread) => (
                <motion.div
                  key={thread.id}
                  className="w-full border border-bg-kruze-secondary rounded-[12px] max-w-3xl mx-auto space-y-3 "
                  layout
                >
                  <table className="w-full bg-white">
                    <thead>
                      <tr>
                        <th className="text-left px-4 py-2 bg-kruze-secondary text-white rounded-tl-lg ">
                          Thread Name
                        </th>
                        <th className="text-right px-4 py-2 bg-kruze-secondary text-white">
                          Date
                        </th>
                        <th className="text-right px-4 py-2 bg-kruze-secondary text-white rounded-tr-lg">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-4 py-2 font-bold">{thread.name}</td>
                        <td className="px-4 py-2 text-right">
                          {thread.date.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <button
                            onClick={() => handleThreadRemove(thread.id)}
                            className="bg-red-500 text-white p-1 rounded-md hover:bg-red-600"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <ul className="px-4 space-y-3">
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
                              message.role === 'user'
                                ? 'bg-slate-50'
                                : 'bg-white'
                            }
                            `}
                        >
                          <MessageBubble
                            role={message.role}
                            message={message.content}
                            onRemove={() => {
                              // remove message from thread messages array
                              setThreads((previous) => {
                                const currentThread = previous.find(
                                  (thread) => thread.id === currentThreadId
                                )

                                if (!currentThread) {
                                  return previous
                                }

                                const updatedThreads = [
                                  ...previous.filter(
                                    (thread) => thread.id !== currentThreadId
                                  ),
                                  {
                                    ...currentThread,
                                    messages: currentThread.messages.filter(
                                      (msg) => msg.content !== message.content
                                    ),
                                  },
                                ]

                                // Save to localStorage
                                localStorage.setItem(
                                  'localThreads',
                                  JSON.stringify(updatedThreads)
                                )

                                return updatedThreads
                              })
                            }}
                          />
                          {message.sources && (
                            <div
                              className="flex flex-wrap bg-white border-t border-slate-300 mt-2 pt-2 -mx-0.5"
                              key={`sources`}
                            >
                              {message.sources.map((item, idx) => {
                                return (
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{
                                      duration: 0.5,
                                      delay: idx * 0.2,
                                    }}
                                    className="w-1/2 lg:w-1/4 px-0.5 mb-2 overflow-hidden"
                                    key={`res-${idx}`}
                                  >
                                    <a
                                      href={item.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="rounded hover:bg-gray-100 bg-gray-100/50 group flex flex-col relative h-full"
                                    >
                                      <div className="aspect-video overflow-hidden">
                                        {item.image ? (
                                          <Image
                                            src={item.image}
                                            width={120}
                                            height={80}
                                            className="w-full rounded-t"
                                            alt={item.title}
                                          />
                                        ) : (
                                          <Image
                                            src="https://kruzeconsulting.com/img/hero_vanessa_2020.jpg"
                                            width={120}
                                            height={80}
                                            className="w-full rounded-t"
                                            alt={item.title}
                                          />
                                        )}
                                      </div>
                                      <div className="p-2 grow flex flex-col justify-between">
                                        <div>
                                          <div className="flex flex-row items-center justify-start -mt-4">
                                            <div className="w-auto">
                                              <div className="flex flex-row items-center justify-start px-1 py-px leading-none border-white border bg-blue-400 font-light lg:text-xs text-[10px] rounded-full text-white w-auto flex-1 capitalize font-bold">
                                                <Type data={item.type} />
                                              </div>
                                            </div>
                                          </div>
                                          <p className="text-xs my-2">
                                            {item.title}
                                          </p>
                                        </div>
                                        <div className="flex flex-row items-center justify-start ">
                                          <div className="w-auto flex-none">
                                            <Image
                                              className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
                                              src="/logo-color.png"
                                              alt="Kruze Logo"
                                              width={14}
                                              height={16}
                                              priority
                                            />
                                          </div>
                                          <div className="text-[10px] md:text-xs w-auto flex-1 capitalize font-medium">
                                            Kruze Consulting
                                          </div>
                                          <div className="text-blue-600 flex-none text-xs text-right">
                                            <span className="group-hover:underline">
                                              {/* Read more{' '} */}
                                              <ArrowTopRightOnSquareIcon className="w-3 h-3 inline opacity-50  group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 duration-200" />
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </a>
                                  </motion.div>
                                )
                              })}
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
                  </ul>
                </motion.div>
              ))}
          </motion.div>
          <div key={'loading'} ref={scrollTargetRef}></div>
          {/* MOtion div with just length of sources (size)  */}

          {isLoading && (
            <div className=" z-20 w-full pb-5">
              <LoadingIndicator
                loading={isLoading}
                resourcesUsed={currentSources.length}
              />
            </div>
          )}
        </div>
        {/* FORM */}
        <AnimatePresence>
          <motion.div
            key={'form-div'}
            // animate positionin top and bottom
            animate={{
              bottom: isSubmitted ? '4px' : 'auto',
              top: isSubmitted ? 'auto' : '0px',
              display: currentThreadId !== null ? 'block' : 'none',
            }}
            className={`
                ${isSubmitted ? 'fixed' : 'relative'} 
                
              w-full mx-auto`}
          >
            <div className="bg-kruze-secondary md:rounded-lg z-10 md:border border-slate-200 relative max-w-3xl mx-auto">
              <div className="">
                <form
                  // onSubmit={submitMessage}
                  onSubmit={handleSubmit}
                  className="p-2 flex gap-1 text-base font-semibold leading-7 relative"
                >
                  <div className="w-auto relative">
                    <div className="flex flex-col space-y-2 h-full items-between">
                      <Listbox
                        value={filterBySourceArray}
                        onChange={setFilterBySourceArray}
                        multiple
                      >
                        {({ open }) => (
                          <>
                            <Listbox.Button
                              className={`${
                                filterBySourceArray.length > 0
                                  ? 'bg-gray-400 text-white'
                                  : 'bg-gray-200 text-gray-600'
                              } w-full px-2 py-1.5 border rounded-md flex-1 font-normal focus:outline-none focus:border-gray-400 relative`}
                            >
                              <FunnelIcon className="w-6 h-6 inline" />
                              {!open && (
                                <div className="absolute w-4 h-4 -top-2 -right-2 leading-none flex items-center justify-center rounded-full text-[10px] text-white bg-blue-600">
                                  {filterBySourceArray.length}
                                </div>
                              )}
                            </Listbox.Button>
                            <Listbox.Options
                              className={
                                'absolute w-24 text-xs top-0 bg-white border border-gray-200 rounded-md shadow-lg z-20'
                              }
                            >
                              {sourceFilters.map((filter, idx) => (
                                <Listbox.Option
                                  key={`${filter}-${idx}`}
                                  value={filter}
                                  className={'px-4 py-2 hover:bg-gray-100'}
                                >
                                  {filter}
                                  {filterBySourceArray.includes(filter) && (
                                    <span className="text-gray-600">✓</span>
                                  )}
                                </Listbox.Option>
                              ))}
                            </Listbox.Options>
                          </>
                        )}
                      </Listbox>

                      <Listbox
                        value={filterByTypeArray}
                        onChange={setFilterByTypeArray}
                        multiple
                      >
                        {({ open }) => (
                          <>
                            <Listbox.Button
                              className={`${
                                filterByTypeArray.length > 0
                                  ? 'bg-gray-400 text-white'
                                  : 'bg-gray-200 text-gray-600'
                              } w-full px-2 py-1.5 border rounded-md flex-1 font-normal focus:outline-none focus:border-gray-400 relative`}
                            >
                              <FunnelIcon className="w-6 h-6 inline" />
                              {!open && (
                                <div className="absolute w-4 h-4 -top-2 -right-2 leading-none flex items-center justify-center rounded-full text-[10px] text-white bg-blue-600">
                                  {filterByTypeArray.length}
                                </div>
                              )}
                            </Listbox.Button>
                            <Listbox.Options
                              className={
                                'absolute w-24 text-xs top-0 bg-white border border-gray-200 rounded-md shadow-lg z-20'
                              }
                            >
                              {typeFilters.map((filter, idx) => (
                                <Listbox.Option
                                  key={`${filter}-${idx}`}
                                  value={filter}
                                  className={'px-4 py-2 hover:bg-gray-100'}
                                >
                                  {filter}
                                  {filterByTypeArray.includes(filter) && (
                                    <span className="text-gray-600">✓</span>
                                  )}
                                </Listbox.Option>
                              ))}
                            </Listbox.Options>
                          </>
                        )}
                      </Listbox>

                    </div>
                  </div>

                  <textarea
                    name="message"
                    onChange={(e) => {
                      setUserMessage(e.target.value)
                    }}
                    value={userMessage || ''}
                    placeholder="Enter user message..."
                    className="px-2 py-1.5 border rounded-md flex-1 font-normal focus:outline-none focus:border-gray-400"
                    rows="3"
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
                          setThreads([])
                          setCurrentThreadId(null)
                          localStorage.removeItem('localThreads')
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
          </motion.div>
        </AnimatePresence>
        {/* EXAMPLES */}
      </div>
    </Layout>
  )
}
