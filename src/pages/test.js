import { Fragment, useState, useEffect, useRef } from 'react'
import { Listbox, Transition, Tab } from '@headlessui/react'

import DiffViewer from 'react-diff-viewer'

// import HighlightDifferences from '@/context/HighlightDifferences'
import {
  VariableIcon,
  DocumentTextIcon,
  LinkIcon,
  XMarkIcon,
  PlusIcon,
  EyeIcon,
  ChevronUpDownIcon,
  AdjustmentsVerticalIcon,
  ClipboardIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/solid'
import ReactMarkdown from 'react-markdown'
import toast, { Toaster } from 'react-hot-toast'

import Layout from '@/components/layout'
import { useResources } from '@/context/resources'
import dynamic from 'next/dynamic'

const CustomEditor = dynamic(
  () => {
    return import('../components/custom-editor')
  },
  { ssr: false }
)

const CustomEditorResult = dynamic(
  () => {
    return import('../components/custom-editor-result')
  },
  { ssr: false }
)

const prompts = [
  {
    id: 0,
    name: 'Add subject, links keywords to content',
    content: `I have content in markdown, I need to update the content with the following details:
      add subject "{{{subject}}}" as Heading level 2,
      add links {{{link_var}}} for internal linking
      add keywords {{{keywords}}} for SEO.
      Keep existing content links, attributes and html tags as is.
      Please provide just the content without any descriptive text.
      the content is as follows:
      {{{document}}}
      `,
  },
  {
    id: 1,
    name: 'Generate content with subject, links and keywords',
    content: `I Need to create content in markdown with the following details:
      add subject "{{{subject}}}" as Heading level 2,
      add links {{{link_var}}} for internal linking,
      add keywords {{{keywords}}} for SEO and for each keyword create a paragraph and related heading level 3.
      Keep existing content links, attributes and html tags as is.
      Please just create the content, I do not need any descriptive text.
      `,
  },
  {
    id: 2,
    name: 'Healy\'s variant 1 - no subjet and links',
    content: `I am the marketing manager for a CPA firm that serves venture capital backed startups
My SEO consultant wants me to modify existing pages to improve the SEO
He has given me a list of keywords to add to the existing page
I have content in markdown, I need to update the content with the following details:
      add keywords {{{keywords}}} for SEO, the keywords are either a single word or a phrase, 
      they have a number of times to add them, so add each keyword the number of times specified if possible. 
      For adding keywords, if possible, add them into existing paragraphs in ways that make sense. 
      You can also add them into the new subject section, but adding them as new sentences or phrases into the existing content is better.
      While you can change the existing content text, keep the existing content links, attributes and html tags as is.
      Please provide just the content without any descriptive text.
      the content is as follows:
      {{{document}}}
      `,
  },
  {
    id: 3,
    name: 'Healy\'s variant 2 - no subjet and links',
    content: `I am the marketing manager for a CPA firm that serves venture capital backed startups
My SEO consultant wants me to modify existing pages to improve the SEO
He has given me a list of keywords to add to the existing page
I have content in markdown, I need to update the content with the following details:
      add keywords {{{keywords}}} for SEO, the keywords are either a single word or a phrase, they have a number of times to add them, 
      so add each keyword the number of times specified, for example if it says to add CPA 3 times, add the term CPA 3 times into the content. 
      For adding keywords, if possible, add them into existing paragraphs in ways that make sense. 
      You can also add them into the new subject section, but adding them as new sentences or phrases into the existing content is better.
      While you can change the existing content text, keep the existing content links, attributes and html tags as is.
      Please provide just the content without any descriptive text.
      the content is as follows:
      {{{document}}}
      `,
  },

]

export const copyToClipboardRichText = async (element) => {
  if (element) {
    const innerHtml = element.innerHTML
    try {
      // Create a new ClipboardItem
      const blob = new Blob([innerHtml], { type: 'text/html' })
      const clipboardItem = new ClipboardItem({ 'text/html': blob })

      // Use the Clipboard API to write the clipboard item
      await navigator.clipboard.write([clipboardItem])
    } catch (err) {
      console.error('Failed to copy!', err)
    } finally {
      console.log('finally')
    }
  }
}

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch (err) {
    console.error('Failed to copy!', err)
  }
}

export default function Test() {
  const myHeaders = new Headers()
  myHeaders.append('Content-Type', 'application/json')

  // useRef to get react markdown content
  const markdownContentRef = useRef(null)

  const [isCopied, setIsCopied] = useState(false)

  const [taKeywords, setTaKeywords] = useState('')

  const { text, markdownContent, handleMarkdownChange } = useResources()

  const [isLoading, setIsLoading] = useState(false)

  const [temperature, setTemperature] = useState(1)

  const [maxTokens, setMaxTokens] = useState(100)

  const [model, setModel] = useState('gpt-4o')

  const [instructions, setInstructions] = useState(
    'You are a helpful startup tax, accounting and bookkeeping assistant.'
  )

  const [value, setValue] = useState('')

  const [keywords, setKeywords] = useState([])
  const [promptLinks, setPromptLinks] = useState([])
  const [promptSubject, setPromptSubject] = useState('')
  const [prompt, setPrompt] = useState('')
  const [selectedPrompt, setSelectedPrompt] = useState(prompts[2])

  const [link, setLink] = useState('')

  const [keyword, setKeyword] = useState('')
  const [time, setTime] = useState(1)

  const [promptToGenerate, setPromptToGenerate] = useState('')

  const clearKeywords = () => {
    setKeywords([])
    setTaKeywords('')
  }

  const addLink = () => {
    setPromptLinks([...promptLinks, { link: link }])
    setKeyword('')
    setLink('')
  }

  const deleteLink = (idx) => {
    setPromptLinks([
      ...promptLinks.slice(0, idx),
      ...promptLinks.slice(idx + 1),
    ])
  }

  const addKeyword = () => {
    if (keyword === '') {
      return
    }
    setKeywords([...keywords, { name: keyword, times: time }])
    setKeyword('')
    setTime(1)
  }

  const deleteKeyword = (idx) => {
    setKeywords([...keywords.slice(0, idx), ...keywords.slice(idx + 1)])
  }

  const handleGenerate = async () => {
    // bundle promptToGenerate with markdownContent
    setIsLoading(true)
    const newMarkdownContent = `${promptToGenerate}`

    const promptRequestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        prompt: newMarkdownContent,
        model,
        temperature,
        instructions,
        maxTokens
      }),
      redirect: 'follow', // manual, *follow, error
    }

    const { completion } = await fetch(
      '/api/openai/custom',
      promptRequestOptions
    )
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
        setIsLoading(false)
      })
      .finally(() => {
        setIsLoading(false)
      })

    if (completion.indexOf('markdown') >= 0) {
      // replace ```markdown with empty string
      const markdown = completion.replace('```markdown', '').replace('```', '')
      // replace ``` with empty string
      setValue(markdown)
    } else {
      setValue(completion)
    }
    // setValue(completion)
    console.log('completion', completion)
  }

  const handleReset = () => {
    setPrompt(prompts[0])
    setPromptSubject('')
    setPromptLinks([])
    setKeywords([])
    setInstructions('')
    setModel('gpt-4o')
    setTemperature(0.1)
    setMaxTokens(100)
    setValue('')
  }

  useEffect(() => {
    let newPrompt = prompt

    if (promptSubject) {
      newPrompt = newPrompt.replace(`{{{subject}}}`, promptSubject)
    } else {
      // if new prompt contains {{{subject}}}, replace it with empty string

      if ( newPrompt && newPrompt.includes(`{{{subject}}}`)) {
        newPrompt = newPrompt.replace(`{{{subject}}}`, '')

      }


      
    }

    if (markdownContent) {
      newPrompt = newPrompt.replace(
        '{{{document}}}',
        `
        
        ${markdownContent}
        `
      )
    } else {

      if ( newPrompt && newPrompt.includes(`{{{document}}}`)) {
        newPrompt = newPrompt.replace('{{{document}}}', '')
      }
    }

    if (promptLinks.length > 0) {
      // join links with comma

      const links = promptLinks.map((link) => `${link.link}`).join(', ')

      newPrompt = newPrompt.replace(`{{{link_var}}}`, links)
    } else {
      if (newPrompt && newPrompt.includes(`{{{link_var}}}`)) {
        newPrompt = newPrompt.replace(`{{{link_var}}}`, '')
      }
    }

    if (keywords.length > 0) {
      let bundleKeywords = ''
      keywords.forEach((keyword) => {
        bundleKeywords += `'${keyword.name}' ${
          keyword.times <= 1 ? ' once' : `${keyword.times} times`
        } , `
      })

      if (newPrompt && newPrompt.includes(`{{{keywords}}}`)) {
        newPrompt = newPrompt.replace(`{{{keywords}}}`, bundleKeywords)
      }

    } else {
      if (newPrompt && newPrompt.includes(`{{{keywords}}}`)) {

        newPrompt = newPrompt.replace(`{{{keywords}}}`, '')
      }
      
    }

    setPromptToGenerate(newPrompt)
  }, [keywords, promptLinks, promptSubject, prompt, markdownContent])

  useEffect(() => {
    if (taKeywords === '') return

    const kwstring = JSON.stringify(taKeywords).replaceAll('"', '')

    const kw = kwstring.split(/\\n/).map((kw) => {
      if (kw === '') {
        return false
      }

      // if kw includes '\t', split by '\t' and get the first element as name and the second element as times

      if (kw.includes('\\t')) {
        const [name, times] = kw.split('\\t')
        console.log('name', name)
        return { name: name, times: times }
      }

      return { name: kw, times: 1 }
    })

    if (kw.length !== 0 && kw[0] !== false) {
      const k = keywords.concat(kw)
      setKeywords(k)
      setTaKeywords('')
    }
  }, [taKeywords, keywords])

  useEffect(() => {
    setPrompt(selectedPrompt.content)
  }, [selectedPrompt])

  return (
    <Layout>
      <div className="xl:container">
        <div className="flex min-h-full flex-wrap justify-center px-6 py-12 lg:px-8 -mx-2 space-y-10">
          <div className="w-full lg:w-7/12 px-2 space-y-2">
            <div className="flex flex-wrap items-center -mx-2">
              <div className="w-auto px-2 font-bold">Prompt</div>
              <div className="w-auto px-2">
                <Listbox value={selectedPrompt} onChange={setSelectedPrompt}>
                  <div className="relative">
                    <Listbox.Button
                      className={
                        'relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left  focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm'
                      }
                    >
                      <span className="block truncate">
                        {selectedPrompt.name}
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
                        {prompts.map((prompt) => (
                          <Listbox.Option
                            key={prompt.id}
                            value={prompt}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 pl-10 pr-4 ${
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
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-64 border border-gray-300 rounded-lg p-2"
            />
            <hr className="my-2" />
            <div>
              <strong>Prompt preview </strong>(disabled){' '}
              <EyeIcon className="w-6 h-6 text-blue-500 inline" />
              <div className="">
                {/* promptToGenerate */}
                <textarea
                  value={promptToGenerate}
                  readOnly={true}
                  disabled
                  className="w-full h-64 border border-gray-300 rounded-lg p-2"
                />
              </div>
            </div>
          </div>
          <div className="w-full lg:w-5/12 space-y-1 px-2">
            <div className="bg-white p-3 rounded-lg">
              <strong>Subject</strong>
              <DocumentTextIcon className="w-6 h-6 text-blue-500 inline" />
              <input
                className="w-full border border-slate-200 p-2"
                placeholder="Subject"
                value={promptSubject}
                onChange={(e) => setPromptSubject(e.target.value)}
              />
            </div>
            <div className="bg-white p-3 rounded-lg space-y-1">
              <div>
                <strong>Keywords</strong>
                <VariableIcon className="w-6 h-6 text-blue-500 inline" />
              </div>
              <Tab.Group>
                <Tab.List>
                  <Tab className={` `}>
                    {({ selected }) => (
                      <div
                        className={`${
                          selected
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-400 text-white'
                        } rounded-t-lg px-2 py-1 text-xs`}
                      >
                        Multiple Keywords
                      </div>
                    )}
                  </Tab>
                  <Tab className={``}>
                    {({ selected }) => (
                      <div
                        className={`${
                          selected
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-400 text-white'
                        } rounded-t-lg px-2 py-1 text-xs`}
                      >
                        Single Keyword
                      </div>
                    )}
                  </Tab>
                </Tab.List>
                <Tab.Panels>
                  <Tab.Panel>
                    <div>
                      <textarea
                        value={taKeywords}
                        placeholder='Paste multiple keywords here, separated by new line "\n"'
                        onChange={(e) => setTaKeywords(e.target.value)}
                        className="w-full h-10 border border-gray-300 rounded-lg p-2"
                      />
                    </div>
                  </Tab.Panel>
                  <Tab.Panel>
                    <div className="flex space-x-1">
                      <input
                        className="w-7/12 border border-slate-200 p-2"
                        placeholder="Keyword"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                      />
                      <input
                        className="w-3/12 border border-slate-200 p-2"
                        type="number"
                        min={1}
                        step={1}
                        placeholder="Times to appear"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                      />
                      <button
                        className="p-2 bg-slate-400 text-white rounded text-xs"
                        onClick={addKeyword}
                      >
                        <PlusIcon className="w-4 h-4 inline" />
                        Add
                      </button>
                    </div>
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
              <div className="flex space-x-2 flex-wrap">
                {keywords.map((keyword, idx) => (
                  <div
                    key={idx}
                    className="border border-slate-400 rounded-full flex items-center"
                  >
                    <span className="text-sm leading-none inline-block px-1">
                      {keyword.name}
                    </span>
                    <input
                      type="number"
                      value={keyword.times}
                      min={1}
                      className="bg-slate-100 mx-1 rounded w-8 text-xs"
                      onChange={(e) => {
                        // update current keyword times
                        const newKeywords = keywords.map((kw, i) => {
                          if (i === idx) {
                            return { ...kw, times: e.target.value }
                          }
                          return kw
                        })
                        setKeywords(newKeywords)
                      }}
                    />
                    <button
                      className="p-1 text-rose-400 block rounded-r-full hover:text-rose-600"
                      onClick={() => deleteKeyword(idx)}
                      type="button"
                    >
                      <XMarkIcon className="w-4 h-4 block" />
                    </button>
                  </div>
                ))}
              </div>
              {keywords.length > 0 && (
                <div>
                  <button
                    className="p-2 bg-rose-400 text-white rounded text-xs"
                    onClick={clearKeywords}
                    type="button"
                  >
                    Clear All Keywords
                  </button>
                </div>
              )}
            </div>
            <div>
              <div className="bg-white p-3 rounded-lg space-y-2">
                <div>
                  <strong>Links</strong>
                  <LinkIcon className="w-6 h-6 text-blue-500 inline" />
                </div>
                <div className="flex space-x-1">
                  <input
                    className="w-auto grow border border-slate-200 p-2"
                    placeholder="Link"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                  />
                  <button
                    className="p-2 bg-slate-400 text-white rounded text-xs"
                    onClick={addLink}
                  >
                    <PlusIcon className="w-4 h-4 inline" />
                    Add
                  </button>
                </div>
                <div className="flex space-x-1 flex-wrap">
                  {promptLinks.map((link, idx) => (
                    <div
                      key={idx}
                      className="border border-slate-400 rounded-full flex items-center"
                    >
                      <span className="text-sm leading-none inline-block px-2">
                        {link.link}
                      </span>
                      <button
                        className="p-1 bg-rose-400 block text-white rounded-r-full hover:bg-rose-600"
                        onClick={() => deleteLink(idx)}
                      >
                        <XMarkIcon className="w-4 h-4 block" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-2 space-y-2">
              <AdjustmentsVerticalIcon className="w-6 h-6 text-blue-500 inline" />
              <div>
                <strong>Instructions</strong>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full border border-slate-200 p-2"
                />
              </div>
              <div>
                <strong>Model</strong>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full border border-slate-200 p-2"
                >
                  <option value="gpt-4o">gpt-4o</option>
                  <option value="gpt-4-turbo">gpt-4-turbo</option>
                  <option value="gpt-4">gpt-4</option>
                </select>
              </div>
              <div className="flex items-center">
                <strong>Temperature</strong> -{' '}
                {/* // input range for temperature */}
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.01"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                />
                <span className="w-10 inline-block text-center">
                  {temperature}
                </span>
              </div>
              <div className="flex items-center">
                <strong>Max Tokens</strong> -{' '}
                <input
                  type="range"
                  min="1"
                  step="1"
                  max={4095}
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(e.target.value)}
                />
                <span className="w-10 inline-block text-center">
                  {maxTokens}
                </span>
              </div>
            </div>
          </div>

          <div className="w-full px-2 space-y-4">
            <div className="flex flex-wrap -mx-2">
              <div className=" w-full lg:w-1/2 px-2 rounded">
                <div className="flex flex-wrap -mx-2">
                  <div className="px-2">
                    <h2>
                      <strong>Initial Document</strong>{' '}
                      <span className="font-mono">Paste Markdown</span>
                    </h2>
                  </div>
                  <div>
                    <button
                      className={`
                    ${isLoading ? 'bg-gray-300 animate-pulse' : 'bg-blue-500'}
            
                    py-0.5 px-1 text-white rounded text-xs
                  `}
                      type="button"
                      onClick={handleGenerate}
                    >
                      {isLoading ? 'Generating...' : 'Generate'}
                    </button>
                  </div>
                </div>
                <hr className="my-2" />
                <textarea
                  onChange={(e) => handleMarkdownChange(e.target.value)}
                  defaultValue={markdownContent}
                  className="mb-2 border p-2 rounded-lg border-slate-200 border w-full block h-96"
                />

                <button
                  className={`
                    ${isLoading ? 'bg-gray-300 animate-pulse' : 'bg-blue-500'}
            
                    py-2 px-6 text-white text-xl rounded-md
                  `}
                  type="button"
                  onClick={handleGenerate}
                >
                  {isLoading ? 'Generating...' : 'Generate'}
                </button>
              </div>
              <div className=" w-full lg:w-1/2 px-2 rounded">
                <div className="flex flex-wrap -mx-2">
                  <div className="px-2">
                    <h2>
                      <strong>Result Document</strong> AI Processed{' '}
                      <span className="font-mono">Markdown</span>
                    </h2>
                  </div>
                  <div>
                    {/* // copy to clipboard */}

                    {value && (
                      <div className="px-4">
                        <button
                          onClick={() => {
                            setIsCopied(true)
                            copyToClipboard(value)
                            setTimeout(() => setIsCopied(false), 1000)
                          }}
                          type="button"
                          className="px-1 py-0.5 flex justify-between bg-blue-500 text-white rounded text-xs hover:bg-blue-600 active:bg-blue-700 group"
                        >
                          {isCopied ? (
                            <>
                              Copied{' '}
                              <ClipboardDocumentCheckIcon className="w-4 h-4" />
                            </>
                          ) : (
                            <>
                              Copy Markdown
                              <ClipboardIcon className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <hr className="my-2" />

                {value ? (
                  <textarea
                    value={value}
                    className="mb-2 border p-2 rounded-lg border-slate-200 border w-full block h-96"
                  />
                ) : (
                  <div className="flex items-start justify-center py-20">
                    <div className="italic text-slate-400">
                      No content to display.
                    </div>
                  </div>
                )}

              
              </div>
            </div>
          </div>

          <div className="w-full px-2 space-y-4 hidden">
            <div className="flex flex-wrap -mx-2">
              <div className=" w-full lg:w-1/2 px-2 rounded">
                <div className="flex flex-row items-center">
                  <h2>
                    <strong>Initial Document</strong> Paste Here the Rich Text
                  </h2>
                  <div className="px-4">
                    <button
                      className={`
                    ${isLoading ? 'bg-gray-300 animate-pulse' : 'bg-blue-500'}
            
                    py-0.5 px-1 text-white rounded text-xs
                  `}
                      type="button"
                      onClick={handleGenerate}
                    >
                      {isLoading ? 'Generating...' : 'Generate'}
                    </button>
                  </div>
                </div>
                <hr className="my-2" />
                <CustomEditor initialData="" />
              </div>
              <div className=" w-full lg:w-1/2 px-2 rounded">
                <div className="flex flex-row items-center">
                  <h2>
                    <strong>Result Document</strong> AI Processed Content
                  </h2>
                  <div className="ml-2">
                    {value && (
                      <div className="px-4">
                        <button
                          onClick={() => {
                            setIsCopied(true)
                            copyToClipboardRichText(markdownContentRef.current)
                            setTimeout(() => setIsCopied(false), 1000)
                          }}
                          type="button"
                          className="px-1 py-0.5 flex justify-between bg-blue-500 text-white rounded text-xs hover:bg-blue-600 active:bg-blue-700 group"
                        >
                          {isCopied ? (
                            <>
                              Copied{' '}
                              <ClipboardDocumentCheckIcon className="w-4 h-4" />
                            </>
                          ) : (
                            <>
                              Copy
                              <ClipboardIcon className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <hr className="my-2" />

                {value ? (
                  <CustomEditorResult initialData={value} />
                ) : (
                  <div className="flex items-start justify-center py-20">
                    <div className="italic text-slate-400">
                      No content to display.
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="-mx-4 flex flex-row items-center justify-between">
              <div className="px-4">
                <button
                  className={`
                ${isLoading ? 'bg-gray-300 animate-pulse' : 'bg-blue-500'}
        
                py-2 px-6 text-white rounded text-xl
              `}
                  type="button"
                  onClick={handleGenerate}
                >
                  {isLoading ? 'Generating...' : 'Generate'}
                </button>
              </div>
              {value && (
                <div className="px-4">
                  <button
                    onClick={() => {
                      setIsCopied(true)
                      copyToClipboardRichText(markdownContentRef.current)
                      setTimeout(() => setIsCopied(false), 1000)
                    }}
                    type="button"
                    className="p-2 w-36 flex justify-between bg-blue-500 text-white rounded text-xs hover:bg-blue-600 active:bg-blue-700 group"
                  >
                    {isCopied ? (
                      <>
                        Copied{' '}
                        <ClipboardDocumentCheckIcon className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Copy to Clipboard
                        <ClipboardIcon className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="w-full px-2 bg-blue-100 rounded-lg py-3 hidden">
            <h2 className="text-5xl">Result</h2>
            <div className="flex items-center space-x-3 my-2">
              <h3 className="font-bold">Rich text</h3>
              <div>
                <button
                  onClick={() => {
                    setIsCopied(true)
                    copyToClipboardRichText(markdownContentRef.current)
                    setTimeout(() => setIsCopied(false), 1000)
                  }}
                  type="button"
                  className="p-2 w-36 flex justify-between bg-blue-500 text-white rounded text-xs hover:bg-blue-600 active:bg-blue-700 group"
                >
                  {isCopied ? (
                    <>
                      Copied <ClipboardDocumentCheckIcon className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Copy to Clipboard
                      <ClipboardIcon className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 w-full gap-4">
              <div className="bg-white rounded p-2 w-full">
                <div
                  ref={markdownContentRef}
                  className="prose prose-a:text-blue-600 w-full"
                >
                  <ReactMarkdown>{value}</ReactMarkdown>
                </div>
              </div>
              <div className="bg-white rounded p-2 prose prose-a:text-blue-600 w-full">
                <h3>Markdown</h3>
                <textarea
                  defaultValue={value}
                  className="border-slate-200 border w-full block h-fit-content"
                />
              </div>
            </div>
          </div>

          {markdownContent && value && (
            <div className="">
              <h3 className="font-bold">View the Differences</h3>
              {/* <HighlightDifferences
                oldText={markdownContent} //
                newText={value} // markdown
              /> */}
              <DiffViewer
                oldValue={markdownContent}
                newValue={value}
                splitView={true}
                leftTitle="Initial Document"
                rightTitle="Result Document"
                compareMethod="diffWords"
                styles={{
                  diffContainer: {
                    overflow: 'auto',
                  },
                  diffRemoved: {
                    backgroundColor: '#ffebee',
                    color: 'red',
                  },
                  diffAdded: {
                    backgroundColor: '#e8f5e9',
                    color: 'green',
                  },
                }}
              />
            </div>
          )}

          <Toaster />
        </div>
      </div>
    </Layout>
  )
}
