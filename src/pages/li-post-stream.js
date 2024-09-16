import { useSession } from 'next-auth/react'
import React, { useState, useEffect, useRef } from 'react'
import Layout from '@/components/layout'
import Image from 'next/image'

import { Listbox, Tab } from '@headlessui/react'

import toast, { Toaster } from 'react-hot-toast'

import dynamic from 'next/dynamic'
import {
  CheckIcon,
  ClipboardIcon,
  ClipboardDocumentCheckIcon,
  ChevronDownIcon,
} from '@heroicons/react/20/solid'

import MessageBubble from '@/components/common/message-bubble'

import { prompts, posters, repostersPrompts } from '../../utils/hardcoded'

import Counter from '@/components/common/counter'

import { parseWithCheerio } from '../../utils/cheerio-axios'

const CustomEditorResult = dynamic(
  () => {
    return import('../components/custom-editor-result')
  },
  { ssr: false }
)

const intialMessage = {
  role: 'system',
  content:
    'You are the social media manager for a CPA firm',
}

export default function LiPost() {
  const { data: session } = useSession()

  const scrollTargetRef = useRef(null)

  const [postGenerated, setPostGenerated] = useState(false)

  const [messages, setMessages] = useState([intialMessage])

  const [currentMessage, setCurrentMessage] = useState('')

  const [isLoading, setIsLoading] = useState(false)

  const [isParsing, setIsParsing] = useState(false)

  const [selectedPrompt, setSelectedPrompt] = useState()

  const [promptContent, setPromptContent] = useState('')

  const [selectedReposterPrompt, setSelectedReposterPrompt] = useState()

  const [reposterPromptContent, setReposterPromptContent] = useState('')

  const [selectedPoster, setSelectedPoster] = useState()

  const [selectedReposter, setSelectedReposter] = useState([])

  const [promptToGenerate, setPromptToGenerate] = useState('')

  const [pageContent, setPageContent] = useState('')

  const [pageUrl, setPageUrl] = useState('')

  const handlePageParse = async () => {
    // use parseWithCheerio function to get page content
    setIsParsing(true)

    try {
      if (!pageUrl) {
        toast.error('Please provide a URL', { duration: 2000 })
        return
      }

      if (!pageUrl.startsWith('http')) {
        toast.error('Please provide a valid URL', { duration: 2000 })
        return
      }
      const { pageContent } = await parseWithCheerio(pageUrl)

      setPageContent(pageContent)
      // setPageUrl(pageUrl)
      toast.success('Page content Ready', { duration: 2000 })
    } catch (error) {
      console.error('Error parsing page:', error)
      toast.error('Error parsing page content')
    } finally {
      setIsParsing(false)
    }
  }

  const handleRemoveMessage = (index) => {
    setMessages((prevMessages) =>
      prevMessages.filter((message, idx) => idx !== index)
    )
  }


  const handleSubmitMessage = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    if (!currentMessage) {
      return
    }

    setMessages([...messages, { role: 'user', content: currentMessage }])
    setCurrentMessage('')
    setTimeout(() => {
      scrollTargetRef.current.scrollIntoView({ behavior: 'smooth' })
    }, 100)

    try {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: currentMessage }],
          model: 'gpt-4o',
          temperature: 0.1,
        }),
      }

      const { completion } = await fetch(
        '/api/openai/messages',
        requestOptions
      ).then((res) => res.json())

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: 'assistant',
          content: completion,
        },
      ])

      if (!postGenerated) {
        setPostGenerated(true)
      }

      toast.success('Completion created successfully')
      setTimeout(() => {
        scrollTargetRef.current.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (error) {
      console.error('Error generating completion:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // const handleGeneratePost = async () => {
  //   setIsLoading(true)

  //   try {
  //     const requestOptions = {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         messages: [
  //           {
  //             role: 'system',
  //             content:
  //               'You are a helpful startup tax, accounting and bookkeeping assistant.',
  //           },
  //           { role: 'user', content: promptToGenerate },
  //         ],
  //         model: 'gpt-4o',
  //         temperature: 0.1,
  //       }),
  //     }

  //     const { completion } = await fetch(
  //       '/api/openai/messages',
  //       requestOptions
  //     ).then((res) => res.json())

  //     setMessages((prevMessages) => [
  //       ...prevMessages,
  //       {
  //         role: 'assistant',
  //         content: completion,
  //       },
  //     ])
  //     toast.success('Completion created successfully')
  //   } catch (error) {
  //     console.error('Error generating completion:', error)
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  // handle prompt to generate update when any of the selected values change
  useEffect(() => {
    // bundle new prompt with selected prompt content, page content, selected poster, selected reposter
    // get all variables values and bundle them together

    const ptg = `${promptContent || 'No prompt content selected'}

    Link to article/source: ${pageUrl || 'No URL provided'}

    Article: ${pageContent || 'No content parsed yet'}
    end of article

    Post Author: ${
      selectedPoster
        ? `${selectedPoster.name} \n ${selectedPoster.description}`
        : 'No Poster Selected'
    }

    Repost instructions: ${
      reposterPromptContent
        ? `${reposterPromptContent}`
        : 'No Reposter Prompt Selected'
    }

    Here are the executives you need to write reposts for. Include a couple of emojis in each: 
    ${
      selectedReposter.length === 0
        ? 'No Reposters Selected'
        : selectedReposter
            .map((person) => `\n ${person.name} \n ${person.description}`)
            .join(' \n\n')
    }
    `

    setPromptToGenerate(ptg)

    if (!postGenerated) {
      setCurrentMessage(ptg)
    }
  }, [
    pageContent,
    selectedPoster,
    selectedReposter,
    pageUrl,
    promptContent,
    reposterPromptContent,
    postGenerated,
  ])

  useEffect(() => {
    if (
      selectedPrompt &&
      selectedPrompt.content &&
      selectedPrompt.content.length > 0
    ) {
      setPromptContent(selectedPrompt.content)
    }
  }, [selectedPrompt])

  useEffect(() => {
    if (
      selectedReposterPrompt &&
      selectedReposterPrompt.content &&
      selectedReposterPrompt.content.length > 0
    ) {
      setReposterPromptContent(selectedReposterPrompt.content)
    }
  }, [selectedReposterPrompt])

  return (
    <Layout>
      <div className="xl:container">
        <div className="flex min-h-full flex-wrap justify-center px-6 py-12 lg:px-8 -mx-2">
          <div className="w-full lg:w-1/2 px-2 space-y-6">
            {/* Select type of content Video/ Post/ Podcast */}

            <div className="w-3/4">
              <div className="font-bold text-xl">1. Select AI prompt</div>
              <div className="text-sm text-gray-500">
                Select prompt to generate Linkedin post
              </div>
              <Listbox value={selectedPrompt} onChange={setSelectedPrompt}>
                {({ open }) => (
                  <>
                    <div className="relative">
                      <Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-left bg-white border border-gray-300 rounded-lg shadow-sm cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                        <span className="block truncate">
                          {selectedPrompt?.name ||
                            'Select Prompt to Generate Post'}
                        </span>

                        <ChevronDownIcon
                          className={`
                          ${open ? 'text-gray-600 rotate-180' : 'text-gray-400'}
                            absolute w-5 h-5 text-gray-400 right-3 top-1/2 -translate-y-1/2
                          `}
                        />
                      </Listbox.Button>
                      <Listbox.Options className="absolute z-10 w-96 py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {prompts.map((prompt) => (
                          <Listbox.Option
                            key={prompt.id}
                            className={({ active }) =>
                              `${
                                active
                                  ? 'text-white bg-blue-600'
                                  : 'text-gray-900'
                              }
                                cursor-default select-none relative py-2 pl-10 pr-4`
                            }
                            value={prompt}
                          >
                            {({ selected, active }) => (
                              <>
                                <span
                                  className={`${
                                    selected ? 'font-semibold' : 'font-normal'
                                  } block truncate`}
                                >
                                  {prompt.name}
                                  {selected && (
                                    <CheckIcon
                                      className=" w-6 h-6 text-emerald-600 inline"
                                      aria-hidden="true"
                                    />
                                  )}
                                </span>
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  </>
                )}
              </Listbox>
            </div>

            <textarea
              className="w-full h-32 p-2 mt-2 border border-gray-300 rounded-lg"
              placeholder="Select prompt or Enter the content here"
              value={promptContent}
              onChange={(e) => setPromptContent(e.target.value)}
            ></textarea>

            {/* Add url input to parse the content */}
            <div>
              <div className="font-bold text-xl">2. Add Content</div>
              <div className="text-sm text-gray-500">
                Add content via URL parse or Text Area
              </div>
              <Tab.Group>
                <Tab.List>
                  <Tab>
                    {({ selected }) => (
                      <div
                        className={`${
                          selected
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-400 text-white'
                        } rounded-t-lg px-2 py-1 text-xs`}
                      >
                        Url Parse
                      </div>
                    )}
                  </Tab>
                  <Tab>
                    {({ selected }) => (
                      <div
                        className={`${
                          selected
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-400 text-white'
                        } rounded-t-lg px-2 py-1 text-xs`}
                      >
                        Text Area Input
                      </div>
                    )}
                  </Tab>
                </Tab.List>
                <Tab.Panels>
                  <Tab.Panel>
                    <div className="p-2 bg-white border border-blue-500 rounded-b-lg space-y-3">
                      <label className="block  font-medium text-gray-700">
                        <div className="text-sm text-gray-500 ">
                          Add url input to parse the content
                        </div>
                      </label>
                      <input
                        type="text"
                        className="relative w-full py-2 pl-3 pr-10 text-left bg-white border border-gray-300 rounded-lg shadow-sm cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Enter the URL here"
                        onChange={(e) => setPageUrl(e.target.value)}
                        value={pageUrl || ''}
                      />

                      <div className="flex flex-row">
                        <button
                          type="button"
                          disabled={isParsing}
                          className={`w-full grow p-2 text-white bg-blue-600 rounded-lg
                            ${isParsing ? 'bg-gray-300  ' : 'bg-blue-500'}
                        ${pageUrl ? 'bg-blue-500' : 'bg-gray-300'}`}
                          onClick={() => handlePageParse()}
                        >
                          {pageContent.length > 0
                            ? 'Reparse'
                            : isParsing
                            ? '...Parsing...'
                            : 'Parse'}
                        </button>
                      </div>
                    </div>
                  </Tab.Panel>
                  <Tab.Panel>
                    <div className="p-2 bg-white border border-blue-500 rounded-b-lg">
                      <div className="text-sm text-gray-500 ">
                        Enter the content here
                      </div>
                      <textarea
                        className="w-full h-32 p-2 mt-2 border border-gray-300 rounded-lg"
                        placeholder="Enter the content here"
                        value={pageContent}
                        onChange={(e) => setPageContent(e.target.value)}
                      ></textarea>
                    </div>
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>

              <div className="mt-2">
                <div className="text-sm text-gray-500">
                  {pageContent.length > 0
                    ? `✅ Content Ready`
                    : 'No content added yet'}
                </div>
                <div className="max-h-[80px] mb-3 p-2 overflow-hidden relative">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-white/10 via-white/70 to-white"></div>
                  <div className="text-xs text-gray-500">
                    {pageContent.length > 0 && `${pageContent}`}
                  </div>
                </div>
                <div className="flex flex-row">
                  {pageContent.length > 0 || pageUrl ? (
                    <button
                      className="w-auto p-2 ml-2 text-white bg-red-600 rounded-lg"
                      onClick={() => {
                        setPageUrl('')
                        setPageContent('')
                      }}
                    >
                      Reset Content
                    </button>
                  ) : (
                    ''
                  )}
                </div>
              </div>
            </div>

            <div>
              {/* Select Who is posting the Post */}

              <div>
                <div className="font-bold text-xl">
                  3. Select Poster
                  {selectedPoster ? `: ${selectedPoster.name}` : ''}
                </div>
                <div className="text-sm text-gray-500">
                  Select who is posting the post
                </div>
                <div className="flex flex-row">
                  <Listbox value={selectedPoster} onChange={setSelectedPoster}>
                    {({ open }) => (
                      <div className="relative">
                        <Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-left bg-white border border-gray-300 rounded-lg shadow-sm cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                          <span className="block truncate">
                            {selectedPoster?.name || 'Select Poster'}
                          </span>

                          <ChevronDownIcon
                            className={` 
                          ${open ? 'text-gray-600 rotate-180' : 'text-gray-400'}
                            absolute w-5 h-5 text-gray-400 right-3 top-1/2 -translate-y-1/2
                          `}
                          />
                        </Listbox.Button>
                        <Listbox.Options className="absolute z-10 w-96 py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          {posters.map((poster) => (
                            <Listbox.Option
                              key={poster.id}
                              className={({ active }) =>
                                `${
                                  active
                                    ? 'text-white bg-blue-600'
                                    : 'text-gray-900'
                                }
                                cursor-default select-none relative py-2 pl-10 pr-4`
                              }
                              value={poster}
                            >
                              {({ selected, active }) => (
                                <>
                                  <span
                                    className={`${
                                      selected ? 'font-semibold' : 'font-normal'
                                    } block truncate`}
                                  >
                                    {poster.name}
                                    {selected && (
                                      <CheckIcon
                                        className=" w-6 h-6 text-emerald-600 inline"
                                        aria-hidden="true"
                                      />
                                    )}
                                  </span>
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </div>
                    )}
                  </Listbox>
                  <div className="ml-2">
                    {/* //reset */}

                    {selectedPoster ? (
                      <button
                        className="w-full p-2 text-sm text-white bg-red-600 rounded-lg"
                        onClick={() => setSelectedPoster('')}
                      >
                        Reset
                      </button>
                    ) : (
                      ''
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 px-2 space-y-6 rounded-lg">
            <div>
              <div className="font-bold text-xl">4. Select Reposter Prompt</div>
              <div className="text-sm text-gray-500">
                Select prompt to generate reposter post
              </div>
              <div className="flex flex-row">
                <Listbox
                  value={selectedReposterPrompt}
                  onChange={setSelectedReposterPrompt}
                >
                  {({ open }) => (
                    <div className="relative">
                      <Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-left bg-white border border-gray-300 rounded-lg shadow-sm cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                        <span className="block truncate">
                          {selectedReposterPrompt
                            ? selectedReposterPrompt.name
                            : 'Select Reposter Prompt'}
                        </span>

                        <ChevronDownIcon
                          className={`
                      ${open ? 'text-gray-600 rotate-180' : 'text-gray-400'}
                        absolute w-5 h-5 text-gray-400 right-3 top-1/2 -translate-y-1/2
                      `}
                        />
                      </Listbox.Button>
                      <Listbox.Options className="absolute z-10 w-96 py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {repostersPrompts.map((prompt) => (
                          <Listbox.Option
                            key={prompt.id}
                            className={({ active }) =>
                              `${
                                active
                                  ? 'text-white bg-blue-600'
                                  : 'text-gray-900'
                              }
                              cursor-default select-none relative py-2 pl-10 pr-4`
                            }
                            value={prompt}
                          >
                            {({ selected, active }) => (
                              <>
                                <span
                                  className={`${
                                    selected ? 'font-semibold' : 'font-normal'
                                  } block truncate`}
                                >
                                  {prompt.name}
                                </span>
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  )}
                </Listbox>
                <div className="ml-2">
                  {/* //reset */}

                  {selectedReposterPrompt ? (
                    <button
                      className="w-full p-2 text-sm text-white bg-red-600 rounded-lg"
                      onClick={() => setSelectedReposterPrompt('')}
                    >
                      Reset
                    </button>
                  ) : (
                    ''
                  )}
                </div>
              </div>
            </div>

            <textarea
              className="w-full h-32 p-2 mt-2 border border-gray-300 rounded-lg"
              placeholder="Select prompt or Enter the content here"
              value={reposterPromptContent}
              onChange={(e) => setReposterPromptContent(e.target.value)}
            ></textarea>

            <div>
              {/* Add Multiple Select to pick up who Reposts */}

              <div>
                <div className="font-bold text-xl">5. Select Reposter</div>
                <div className="text-sm text-gray-500">
                  Select who is reposting the post
                </div>
                <div className="flex flex-wrap w-full gap-2">
                  <div className='max-w-md lg:max-w-none'>
                    <Listbox
                      value={selectedReposter}
                      onChange={setSelectedReposter}
                      multiple
                    >
                      {({ open }) => (
                        <div className="relative w-full">
                          <Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-left bg-white border border-gray-300 rounded-lg shadow-sm cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                            <span className="block truncate">
                              {selectedReposter.length > 0
                                ? 'Reposters: '
                                : 'Select Reposter'}
                              {selectedReposter
                                .map((person) => person.name)
                                .join(', ')}
                            </span>
                            <ChevronDownIcon
                              className={`
                          ${open ? 'text-gray-600 rotate-180' : 'text-gray-400'}
                            absolute w-5 h-5 text-gray-400 right-3 top-1/2 -translate-y-1/2
                          `}
                            />
                          </Listbox.Button>
                          <Listbox.Options className="absolute z-10 w-96 py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            {posters.map((reposter) => (
                              <Listbox.Option
                                key={reposter.id}
                                className={({ active }) =>
                                  `${
                                    active
                                      ? 'text-white bg-blue-600'
                                      : 'text-gray-900'
                                  }
                                cursor-default select-none relative py-2 pl-10 pr-4`
                                }
                                value={reposter}
                              >
                                {({ selected, active }) => (
                                  <>
                                    <span
                                      className={`${
                                        selected ? 'font-semibold' : 'font-normal'
                                      } block truncate`}
                                    >
                                      {reposter.name}
                                    </span>
                                  </>
                                )}
                              </Listbox.Option>
                            ))}
                          </Listbox.Options>
                        </div>
                      )}
                    </Listbox>
                  </div>
                  <div className="">
                    {/* //reset */}

                    {selectedReposter.length > 0 ? (
                      <button
                        className="w-full p-2 text-sm text-white bg-red-600 rounded-lg"
                        onClick={() => setSelectedReposter([])}
                      >
                        Reset
                      </button>
                    ) : (
                      ''
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">
                    {selectedReposter.length > 0
                      ? `Reposters: ${selectedReposter
                          .map((person) => person.name)
                          .join(', ')}`
                      : 'No reposter selected yet'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-blue-600 my-6 w-full" />

          <div className="relative bg-white w-full">
            <div className="divide-y divide-gray-300/50 border-t border-gray-300/50">
              <div className="space-y-6 py-8">
                <ul className="space-y-4 px-4">
                  {messages.map((item, idx) => (
                    <li
                      key={idx}
                      className={`relative flex gap-2  ${
                        item.role === 'user'
                          ? 'ml-10 justify-end flex-row-reverse'
                          : 'mr-10 justify-start'
                      }`}
                    >
                      <div
                        className={`w-auto`}
                      >
                        {item.role === 'user' ? (
                          <Image
                            className="h-8 w-8 rounded-full sticky top-24"
                            width={32}
                            height={32}
                            src={session.user.image}
                            alt=""
                          />
                        ) : item.role === 'system' ? (
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

                      <MessageBubble message={item.content} role={item.role} 
                        onRemove={() => handleRemoveMessage(idx)}
                      />
                    </li>
                  ))}
                </ul>
                <div ref={scrollTargetRef}></div>
              </div>
              <form
                onSubmit={handleSubmitMessage}
                className="p-4 flex flex-col gap-2 text-base font-semibold leading-7 h-[300px]"
              >
                <textarea
                  name="message"
                  placeholder="Enter User Message"
                  className="px-2 h-screen py-1.5 rounded-md flex-1 font-normal focus:outline-none focus:border-blue-400 border-2 border-blue-600"
                  value={currentMessage}
                  readOnly={!postGenerated}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                />
                <button className="bg-blue-600 py-3 px-2.5 rounded-md text-white flex items-center justify-center hover:">
                  {isLoading ? (
                    <span>
                      Generating for
                      {' '}
                      <Counter /> 
                      {' '}
                      seconds
                    </span>
                  ) : (
                    'Submit'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
        <Toaster />
      </div>
    </Layout>
  )
}
