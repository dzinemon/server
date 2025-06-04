import React, { Fragment, useState, useEffect, useRef } from 'react'
import Layout from '@/components/layout'
import Image from 'next/image'

import { usePrompts } from '@/context/prompts'
import { useMembers } from '@/context/members'
import { useResources } from '@/context/resources'

import { Listbox, Tab, Transition } from '@headlessui/react'

import toast, { Toaster } from 'react-hot-toast'

import { LoadingLine } from '@/components/common/chatloadingstate'

import dynamic from 'next/dynamic'
import {
  CheckIcon,
  ChevronUpDownIcon,
  ChevronDownIcon,
  TrashIcon,
  DocumentTextIcon,
} from '@heroicons/react/20/solid'

import MessageBubble from '@/components/common/message-bubble'

import ModelPicker from '@/components/common/modelpicker'

import { useUser } from '@/context/user'

import {
  DeletePromptDialog,
  SavePromptDialog,
  SaveAsPromptDialog,
  AddPromptDialog,
  AddMemberDialog,
  SaveMemberDialog,
  SaveAsMemberDialog,
  DeleteMemberDialog,
} from '@/components/generate'

import Counter from '@/components/common/counter'

const CustomEditorResult = dynamic(
  () => {
    return import('../components/custom-editor-result')
  },
  { ssr: false }
)

export default function LiPost() {
  const { currentUser } = useUser()

  const { currentModel, setCurrentModel } = useResources()

  const {
    aiPrompts,
    reposterPrompts,
    currentPrompt,
    setCurrentPrompt,
    handlePromptFetch,
    fetchedPrompts,
    fetchAiPrompts,
    fetchReposterPrompts,
  } = usePrompts()

  const {
    members,
    currentMember,
    setCurrentMember,
    fetchMembers,
    fetchedMembers,
    fetchMemberById,
  } = useMembers()

  const myHeaders = new Headers()
  myHeaders.append('Content-Type', 'application/json')

  const [openSaveDialog, setOpenSaveDialog] = useState(false)

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)

  const [openSaveAsDialog, setOpenSaveAsDialog] = useState(false)

  const [openAddDialog, setOpenAddDialog] = useState(false)

  const [openAddMemberDialog, setOpenAddMemberDialog] = useState(false)

  const [openSaveMemberDialog, setOpenSaveMemberDialog] = useState(false)

  const [openSaveAsMemberDialog, setOpenSaveAsMemberDialog] = useState(false)

  const [openDeleteMemberDialog, setOpenDeleteMemberDialog] = useState(false)

  const scrollTargetRef = useRef(null)

  const [postGenerated, setPostGenerated] = useState(false)

  const [messages, setMessages] = useState([])

  const [currentMessage, setCurrentMessage] = useState('')

  const [isLoading, setIsLoading] = useState(false)

  const [isParsing, setIsParsing] = useState(false)

  const [selectedPrompt, setSelectedPrompt] = useState()

  const [promptContent, setPromptContent] = useState('')

  const [selectedReposterPrompt, setSelectedReposterPrompt] = useState()

  const [reposterPromptContent, setReposterPromptContent] = useState('')

  const [selectedPoster, setSelectedPoster] = useState()

  const [selectedReposter, setSelectedReposter] = useState([])

  const [pageContent, setPageContent] = useState('')

  const [pageUrl, setPageUrl] = useState('')

  const handleSelectedAiPromptChange = async (e) => {
    // Check if the prompt already exists in fetched prompts
    const existingPrompt = fetchedPrompts.find((prompt) => prompt.id === e.id)

    if (existingPrompt) {
      setSelectedPrompt(existingPrompt)
      console.log('Selected Prompt from cache:', existingPrompt)
    } else {
      // Fetch prompt content by id using handlePromptFetch
      const p = await handlePromptFetch(e.id)

      console.log('Selected Prompt Fetched:', p)

      if (p) {
        setSelectedPrompt(p)
      }
    }
  }

  const handleSelectedPosterChange = async (e) => {
    // check if the selected poster exists in the list of fetched members
    const existingMember = fetchedMembers.find((member) => member.id === e.id)

    if (existingMember) {
      setSelectedPoster(existingMember)
      console.log('Selected Poster from cache:', existingMember)
    } else {
      // Fetch member by id using fetchMemberById
      const m = await fetchMemberById(e.id)

      console.log('Selected Poster Fetched:', m)

      if (m) {
        setSelectedPoster(m)
      }
    }
  }

  const handleSelectedReposterChange = async (e) => {
    // check if the selected reposter exists in the list of fetched members

    for (const reposter of e) {
      const existingMember = fetchedMembers.find(
        (member) => member.id === reposter.id
      )

      if (existingMember) {
        setSelectedReposter((prev) => {
          if (prev.find((m) => m.id === reposter.id)) {
            return prev
          }
          return [...prev, existingMember]
        })
        console.log('Selected Reposter from cache:', existingMember)
      } else {
        // Fetch member by id using fetchMemberById
        const m = await fetchMemberById(reposter.id)

        console.log('Selected Reposter Fetched:', m)

        if (m) {
          setSelectedReposter((prev) => [...prev, m])
        }
      }
    }
  }

  const handleSelectedReposterPromptChange = async (e) => {
    // Check if the prompt already exists in fetched prompts
    const existingPrompt = fetchedPrompts.find((prompt) => prompt.id === e.id)

    if (existingPrompt) {
      setSelectedReposterPrompt(existingPrompt)
      console.log('Selected Reposter Prompt from cache:', existingPrompt)
    } else {
      // Fetch prompt content by id using handlePromptFetch
      const p = await handlePromptFetch(e.id)

      console.log('Selected Reposter Prompt Fetched:', p)

      if (p) {
        setSelectedReposterPrompt(p)
      }
    }
  }

  const handleRestart = () => {
    setMessages([])
    setCurrentMessage('')
    setPostGenerated(false)
  }

  const handlePageParse = async () => {
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({ url: pageUrl }),
      redirect: 'follow',
    }

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

      const response = await fetch('/api/parse', requestOptions)

      if (!response.ok) {
        throw new Error('Failed to parse page')
      }

      const { pageContent } = await response.json()

      setPageContent(pageContent)
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

    if (!currentMessage || currentMessage.length === 0) {
      return
    }

    setIsLoading(true)

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
          model: currentModel,
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
        ? `${selectedPoster.name} \n ${selectedPoster.content}`
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
            .map((person) => `\n ${person.name} \n ${person.content}`)
            .join(' \n\n')
    }
    `

    // setPromptToGenerate(ptg)

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

  useEffect(() => {
    setCurrentPrompt(selectedPrompt)
  }, [selectedPrompt, setCurrentPrompt])

  useEffect(() => {
    setSelectedReposterPrompt(selectedReposterPrompt)
  }, [selectedReposterPrompt, setSelectedReposterPrompt])

  useEffect(() => {
    setCurrentMember(selectedPoster)
  }, [selectedPoster, setCurrentMember])

  // is members are changed check if selected poster is still in the list and if not reset it do the same for reposter

  useEffect(() => {
    if (selectedPoster && selectedPoster.id) {
      const member = members.find((member) => member.id === selectedPoster.id)
      if (!member) {
        setSelectedPoster('')
      }
    }

    if (selectedReposter && selectedReposter.length > 0) {
      const reposter = selectedReposter.filter((reposter) => {
        return members.find((member) => member.id === reposter.id)
      })

      setSelectedReposter(reposter)
    }
  }, [members, selectedPoster, selectedReposter])

  // check if selected prompt exists in the list of ai prompts and if not reset it

  useEffect(() => {
    if (selectedPrompt && selectedPrompt.id) {
      const prompt = aiPrompts.find((prompt) => prompt.id === selectedPrompt.id)
      if (!prompt) {
        setSelectedPrompt('')
      }
    }
  }, [aiPrompts, selectedPrompt])

  // check if selected reposter prompt exists in the list of reposter prompts and if not reset it

  useEffect(() => {
    if (selectedReposterPrompt && selectedReposterPrompt.id) {
      const prompt = reposterPrompts.find(
        (prompt) => prompt.id === selectedReposterPrompt.id
      )
      if (!prompt) {
        setSelectedReposterPrompt('')
      }
    }
  }, [reposterPrompts, selectedReposterPrompt])

  return (
    <Layout>
      <div className="xl:container">
        <div className="flex min-h-full flex-wrap justify-center px-6 py-12 lg:px-8 -mx-2">
          <div className="w-full lg:w-1/2 px-2 space-y-6">
            <div>
              <div className="font-bold text-xl">0. Select Model</div>
              <div className="text-sm text-gray-500">
                Select model to generate content
                <ModelPicker />
              </div>
            </div>

            <div className="w-full">
              <div className="font-bold text-xl">1. Select AI prompt</div>
              <div className="text-sm text-gray-500">
                Select prompt to generate Linkedin post
              </div>

              <div className="flex -mx-2">
                <div className="w-auto grow px-2">
                  <Listbox
                    value={selectedPrompt ? selectedPrompt : ''}
                    onChange={(e) => handleSelectedAiPromptChange(e)}
                  >
                    <div className="relative">
                      <Listbox.Button
                        className={
                          'relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left  focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm'
                        }
                        onClick={() => {
                          if (aiPrompts.length === 0) {
                            fetchAiPrompts()
                          }
                        }}
                      >
                        <span className="block truncate">
                          <DocumentTextIcon className="w-5 h-5 inline" />
                          {selectedPrompt
                            ? `${selectedPrompt.name} `
                            : 'Select a prompt'}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronUpDownIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </span>
                      </Listbox.Button>
                      <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options
                          className={
                            'absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm'
                          }
                        >
                          {aiPrompts &&
                            aiPrompts.map((prompt) => (
                              <Listbox.Option
                                key={prompt.id}
                                value={prompt}
                                className={({ active }) =>
                                  `relative cursor-default select-none py-2 px-4 ${
                                    active
                                      ? 'bg-blue-100 text-blue-900'
                                      : 'text-slate-900'
                                  }`
                                }
                              >
                                {prompt.name}
                              </Listbox.Option>
                            ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </Listbox>
                </div>
                <div className="w-auto px-2 space-x-2 shrink flex">
                  <button
                    title="Open Modal to Create a New AI Prompt"
                    className="p-2 bg-emerald-300 text-white rounded text-xs hover:bg-emerald-500"
                    onClick={() => {
                      setCurrentPrompt({
                        name: '',
                        content: '',
                        type: 'ai',
                      })
                      setOpenAddDialog(true)
                    }}
                  >
                    Add New
                  </button>
                  {currentPrompt && (
                    <>
                      <button
                        className="p-2 bg-slate-400 text-white rounded text-xs hover:bg-slate-600"
                        onClick={() => {
                          setCurrentPrompt(selectedPrompt)
                          setOpenSaveDialog(true)
                        }}
                        title="Save Changes to Current Prompt"
                      >
                        Save
                      </button>
                    </>
                  )}
                  {currentPrompt && currentPrompt.id && (
                    <>
                      <button
                        className="p-2 bg-slate-400 text-white rounded text-xs hover:bg-slate-600"
                        title="Save Prompt As / Clone Prompt"
                        onClick={() => {
                          setCurrentPrompt(selectedPrompt)
                          setOpenSaveAsDialog(true)
                        }}
                      >
                        Save As
                      </button>
                      <button
                        title="Delete Prompt"
                        onClick={() => {
                          setCurrentPrompt(selectedPrompt)
                          setOpenDeleteDialog(true)
                        }}
                        className="p-2 bg-rose-400 text-white rounded text-xs hover:bg-rose-600"
                      >
                        <TrashIcon className="w-4 h-4 inline" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <AddPromptDialog open={openAddDialog} setOpen={setOpenAddDialog} />

            {currentPrompt && (
              <>
                <SavePromptDialog
                  open={openSaveDialog}
                  setOpen={setOpenSaveDialog}
                />
                <DeletePromptDialog
                  open={openDeleteDialog}
                  setOpen={setOpenDeleteDialog}
                />
                <SaveAsPromptDialog
                  open={openSaveAsDialog}
                  setOpen={setOpenSaveAsDialog}
                />
              </>
            )}

            <textarea
              className="w-full h-32 p-2 mt-2 border border-gray-300 rounded-lg"
              placeholder="Select prompt or Enter the content here"
              value={selectedPrompt?.content || 'No prompt selected'}
              onChange={(e) =>
                setSelectedPrompt({
                  ...selectedPrompt,
                  content: e.target.value,
                })
              }
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
                      className="w-auto p-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
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
          </div>

          <div className="w-full lg:w-1/2 px-2 space-y-6 rounded-lg">
            <div>
              {/* Select Who is posting the Post */}

              <div>
                <div className="font-bold text-xl">
                  3. Select Poster{' '}
                  {selectedPoster && members.length > 0 ? (
                    `: ${selectedPoster.name}`
                  ) : (
                    <span className="text-sm font-normal text-gray-400">
                      Select or create one
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  Select who is posting the post
                </div>
                <div className="flex flex-row gap-2">
                  <div className="w-auto">
                    <Listbox
                      value={selectedPoster ? selectedPoster : ''}
                      onChange={(e) => handleSelectedPosterChange(e)}
                    >
                      {({ open }) => (
                        <div className="relative">
                          <Listbox.Button
                            className="relative w-full py-2 pl-3 pr-10 text-left bg-white border border-gray-300 rounded-lg shadow-sm cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            onClick={() => {
                              if (members.length === 0) {
                                fetchMembers()
                              }
                            }}
                          >
                            <span className="block truncate">
                              {selectedPoster?.name || 'Select Poster'}
                            </span>
                            <ChevronDownIcon
                              className={`
                            ${
                              open
                                ? 'text-gray-600 rotate-180'
                                : 'text-gray-400'
                            }
                              absolute w-5 h-5 text-gray-400 right-3 top-1/2 -translate-y-1/2
                            `}
                            />
                          </Listbox.Button>
                          <Listbox.Options className="absolute z-10 w-96 py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            {members.map((poster) => (
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
                                        selected
                                          ? 'font-semibold'
                                          : 'font-normal'
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
                  </div>
                  <div className="w-auto flex gap-1">
                    {/* manage members */}
                    <button
                      className="p-2 bg-emerald-300 text-white rounded text-xs hover:bg-emerald-500"
                      onClick={() => {
                        setCurrentMember({
                          name: '',
                          content: '',
                        })
                        setOpenAddMemberDialog(true)
                      }}
                    >
                      Add New
                    </button>
                    {currentMember && (
                      <>
                        <button
                          className="p-2 bg-slate-400 text-white rounded text-xs hover:bg-slate-600"
                          onClick={() => setOpenSaveMemberDialog(true)}
                        >
                          Save
                        </button>

                        <button
                          className="p-2 bg-slate-400 text-white rounded text-xs hover:bg-slate-600"
                          onClick={() => setOpenSaveAsMemberDialog(true)}
                        >
                          Save As
                        </button>

                        <button
                          className="p-2 bg-rose-400 text-white rounded text-xs hover:bg-rose-600"
                          onClick={() => setOpenDeleteMemberDialog(true)}
                        >
                          <TrashIcon className="w-4 h-4 inline" />
                        </button>
                      </>
                    )}
                  </div>
                  <div className="ml-2">
                    {/* //reset */}

                    {selectedPoster ? (
                      <button
                        className="w-auto p-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
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

            <div>
              <div className="font-bold text-xl">4. Select Reposter Prompt</div>
              <div className="text-sm text-gray-500">
                Select prompt to generate reposter post
              </div>
              <div className="flex flex-row">
                <div className="w-auto shrink">
                  <div className="w-auto grow px-2">
                    <Listbox
                      value={
                        selectedReposterPrompt ? selectedReposterPrompt : ''
                      }
                      onChange={(e) => handleSelectedReposterPromptChange(e)}
                    >
                      <div className="relative">
                        <Listbox.Button
                          className={
                            'relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left  focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm'
                          }
                          onClick={() => {
                            if (reposterPrompts.length === 0) {
                              fetchReposterPrompts()
                            }
                          }}
                        >
                          <span className="block truncate">
                            <DocumentTextIcon className="w-5 h-5 inline" />
                            {selectedReposterPrompt
                              ? `${selectedReposterPrompt.name} `
                              : 'Select a prompt'}
                          </span>
                          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronUpDownIcon
                              className="h-5 w-5 text-gray-400"
                              aria-hidden="true"
                            />
                          </span>
                        </Listbox.Button>
                        <Transition
                          as={Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <Listbox.Options
                            className={
                              'absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm'
                            }
                          >
                            {reposterPrompts &&
                              reposterPrompts.map((prompt) => (
                                <Listbox.Option
                                  key={prompt.id}
                                  value={prompt}
                                  className={({ active }) =>
                                    `relative cursor-default select-none py-2 px-4 ${
                                      active
                                        ? 'bg-blue-100 text-blue-900'
                                        : 'text-slate-900'
                                    }`
                                  }
                                >
                                  {prompt.name}
                                </Listbox.Option>
                              ))}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    </Listbox>
                  </div>
                </div>

                <div className="w-auto px-2 space-x-2 shrink flex">
                  <button
                    title="Open Modal to Create a New Reposter Prompt"
                    className="p-2 bg-emerald-300 text-white rounded text-xs hover:bg-emerald-500"
                    onClick={() => {
                      setCurrentPrompt({
                        name: '',
                        content: '',
                        type: 'reposter',
                      })
                      setOpenAddDialog(true)
                    }}
                  >
                    Add New
                  </button>
                  {selectedReposterPrompt && (
                    <>
                      <button
                        className="p-2 bg-slate-400 text-white rounded text-xs hover:bg-slate-600"
                        onClick={() => {
                          setCurrentPrompt(selectedReposterPrompt)
                          setOpenSaveDialog(true)
                        }}
                        title="Save Changes to Current Prompt"
                      >
                        Save
                      </button>
                    </>
                  )}

                  {selectedReposterPrompt && selectedReposterPrompt.id && (
                    <>
                      <button
                        className="p-2 bg-slate-400 text-white rounded text-xs hover:bg-slate-600"
                        title="Save Prompt As / Clone Prompt"
                        onClick={() => {
                          setCurrentPrompt(selectedReposterPrompt)
                          setOpenSaveAsDialog(true)
                        }}
                      >
                        Save As
                      </button>
                      <button
                        title="Delete Prompt"
                        onClick={() => {
                          setCurrentPrompt(selectedReposterPrompt)
                          setOpenDeleteDialog(true)
                        }}
                        className="p-2 bg-rose-400 text-white rounded text-xs hover:bg-rose-600"
                      >
                        <TrashIcon className="w-4 h-4 inline" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <textarea
              className="w-full h-32 p-2 mt-2 border border-gray-300 rounded-lg"
              placeholder="Select prompt or Enter the content here"
              value={selectedReposterPrompt?.content || 'No prompt selected'}
              onChange={(e) =>
                setSelectedReposterPrompt({
                  ...selectedReposterPrompt,
                  content: e.target.value,
                })
              }
            ></textarea>

            <div>
              {/* Add Multiple Select to pick up who Reposts */}

              <div>
                <div className="font-bold text-xl">5. Select Reposter</div>
                <div className="text-sm text-gray-500">
                  Select who is reposting the post
                </div>
                <div className="flex flex-wrap w-full gap-2">
                  <div className="max-w-md lg:max-w-none">
                    <Listbox
                      value={selectedReposter ? selectedReposter : ''}
                      onChange={(e) => handleSelectedReposterChange(e)}
                      multiple
                    >
                      {({ open }) => (
                        <div className="relative w-full">
                          <Listbox.Button
                            className="relative w-full py-2 pl-3 pr-10 text-left bg-white border border-gray-300 rounded-lg shadow-sm cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            onClick={() => {
                              if (members.length === 0) {
                                fetchMembers()
                              }
                            }}
                          >
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
                            {members.map((reposter) => (
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
                                        selected
                                          ? 'font-semibold'
                                          : 'font-normal'
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
                  <div className="w-auto flex">
                    <button
                      className="p-2 bg-emerald-300 text-white rounded text-xs hover:bg-emerald-500"
                      onClick={() => {
                        setCurrentMember({
                          name: '',
                          content: '',
                        })
                        setOpenAddMemberDialog(true)
                      }}
                    >
                      Add New
                    </button>
                  </div>
                  <div className="w-auto">
                    {/* //reset */}

                    {selectedReposter.length > 0 ? (
                      <button
                        className="w-auto p-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
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

            <div className="w-full px-2 bg-rose-100 border border-rose-200 py-2 mb-4 rounded-lg">
              <div className="flex gap-3 items-center">
                <div>
                  <div className="font-bold text-xl">Restart AI Chat</div>
                  <div className="text-sm text-gray-500 max-w-xs">
                    Restart the AI Chat and clear all messages, to generate a
                    new post
                  </div>
                </div>
                <div>
                  <button
                    className="w-auto p-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
                    onClick={handleRestart}
                  >
                    Restart
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full block my-6">
            {isLoading ? (
              <div className="w-full">
                <LoadingLine />
              </div>
            ) : (
              <div className="border-t border-blue-600 w-full" />
            )}
          </div>

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
                      <div className={`w-auto`}>
                        {item.role === 'user' ? (
                          <Image
                            className="h-8 w-8 rounded-full sticky top-24"
                            width={32}
                            height={32}
                            src={currentUser?.image}
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

                      <MessageBubble
                        message={item.content}
                        role={item.role}
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

                <button
                  disabled={isLoading}
                  className="bg-blue-600 disabled:bg-slate-800 py-3 px-2.5 rounded-md text-white flex items-center justify-center hover:bg-blue-700"
                >
                  {isLoading ? (
                    <span>
                      Generating for <Counter /> seconds
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
      <AddMemberDialog
        open={openAddMemberDialog}
        setOpen={setOpenAddMemberDialog}
      />
      {currentMember && (
        <>
          <SaveMemberDialog
            open={openSaveMemberDialog}
            setOpen={setOpenSaveMemberDialog}
          />
          <SaveAsMemberDialog
            open={openSaveAsMemberDialog}
            setOpen={setOpenSaveAsMemberDialog}
          />
          <DeleteMemberDialog
            open={openDeleteMemberDialog}
            setOpen={setOpenDeleteMemberDialog}
          />
        </>
      )}
    </Layout>
  )
}
