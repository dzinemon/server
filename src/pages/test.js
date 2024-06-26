import { useState, useEffect } from 'react'
import {
  UserIcon,
  VariableIcon,
  DocumentTextIcon,
  XMarkIcon,
  PlusIcon,
  EyeIcon,
  AdjustmentsVerticalIcon,
} from '@heroicons/react/24/solid'
import ReactMarkdown from "react-markdown";
import toast, { Toaster } from 'react-hot-toast';


import { useResources } from '@/context/resources'
import dynamic from 'next/dynamic';

const CustomEditor = dynamic( () => {
  return import( '../components/custom-editor' );
}, { ssr: false } );

const initialMarkdownContent = '**StartInitial** writing *something*...'

const prompts = [
  `I have post body markdown file, 
    I need to rewrite it and add a paragraph about 
    {{{ subject }}} 
     at the end of the post, 
     use links {{{link_var}}} in text to link to the page, 
     use keywords {{{ keywords }}} in the text to improve SEO,
     keep the internal links and add heading H2 for new section in markdown. Return markdown string.`,
]

export default function Login() {

  const myHeaders = new Headers()
  myHeaders.append('Content-Type', 'application/json')

  const { text, markdownContent } = useResources()

  const [isLoading, setIsLoading] = useState(false)

  const [temperature, setTemperature] = useState(1)

  const [model, setModel] = useState('gpt-4o')

  const [instructions, setInstructions] = useState(
    'You are a helpful startup tax, accounting and bookkeeping assistant.'
  )

  const [value, setValue] = useState('')

  const [keywords, setKeywords] = useState([])
  const [promptLinks, setPromptLinks] = useState([])
  const [promptSubject, setPromptSubject] = useState('')
  const [prompt, setPrompt] = useState(prompts[0])

  const [link, setLink] = useState('')

  const [keyword, setKeyword] = useState('')
  const [time, setTime] = useState(1)

  const [promptToGenerate, setPromptToGenerate] = useState('')

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
    setKeywords([...keywords, { name: keyword, times: time }])
    setKeyword('')
    setTime(0)
  }

  const deleteKeyword = (idx) => {
    setKeywords([...keywords.slice(0, idx), ...keywords.slice(idx + 1)])
  }

  const handleGenerate = async () => {
    // bundle promptToGenerate with markdownContent
    setIsLoading(true)
    const newMarkdownContent = `${promptToGenerate}

    post body markdown:
     ${markdownContent}`
    
    const promptRequestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        prompt: newMarkdownContent,
        model, temperature, instructions
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
      }).finally(() => {
        setIsLoading(false)
      })

      if (completion.indexOf('markdown') >= 0) {
        // replace ```markdown with empty string
        const markdown = completion.replace('```markdown', '').replace('```', '')
        // replace ``` with empty string
        setValue(markdown)

      }
    // setValue(completion)
    console.log('completion', completion)
  }

  const handleReset = () => {
    setPrompt('')
    setPromptSubject('')
    setPromptLinks([])
    setKeywords([])
    setInstructions('')
    setModel('gpt-4o')
    setTemperature(0.1)
    setValue('')
  }

  useEffect(() => {
    let newPrompt = prompt

    newPrompt = newPrompt.replace(`{{{ subject }}}`, promptSubject)

    if (promptLinks.length > 0) {
      // join links with comma

      const links = promptLinks.map((link) => `${link.link}`).join(', ')

      newPrompt = newPrompt.replace(`{{{link_var}}}`, links)
    }

    if (keywords.length > 0) {
      let bundleKeywords = ''
      keywords.forEach((keyword) => {
        bundleKeywords += `'${keyword.name}' ${
          keyword.times <= 1 ? ' once' : `${keyword.times} times`
        } , `
      })

      newPrompt = newPrompt.replace(`{{{ keywords }}}`, bundleKeywords)
    }

    setPromptToGenerate(newPrompt)
  }, [keywords, promptLinks, promptSubject, prompt])

  return (
    <div className="flex min-h-full flex-wrap justify-center px-6 py-12 lg:px-8 -mx-4 space-y-10">
      <Toaster />
      <div className="w-full lg:w-7/12 px-4">
        Prompt
        <DocumentTextIcon className="w-6 h-6 text-blue-500 inline" />
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full h-64 border border-gray-300 rounded-lg p-2"
        />

        <hr className="my-2" />
        <div>
          Prompt preview <EyeIcon className="w-6 h-6 text-blue-500 inline" />
          <div className="bg-white/30 p-2">{promptToGenerate}</div>
        </div>
      </div>
      
      
      <div className="w-full lg:w-5/12 space-y-1 px-4">

        
          
          <div className="bg-white p-3 rounded-lg">
          Subject
          <DocumentTextIcon className="w-6 h-6 text-blue-500 inline" />
            <input
              className='w-full border border-slate-200 p-2'
              placeholder="Subject"
              value={promptSubject}
              onChange={(e) => setPromptSubject(e.target.value)}
            />
          </div>
        
      


        <div className="bg-white p-3 rounded-lg">
          Keywords
          <VariableIcon className="w-6 h-6 text-blue-500 inline" />
          <div className='flex space-x-1'>
            <input
              className='w-7/12 border border-slate-200 p-2'
              placeholder="Keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <input
              className='w-3/12 border border-slate-200 p-2'
              type="number"
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
          <div className='flex space-x-1 flex-wrap'>
            {keywords.map((keyword, idx) => (
              <div key={idx} className='border border-slate-400 rounded-full flex items-center'>
                <span className='text-sm leading-none inline-block px-1'>
                  {keyword.name} - {keyword.times}
                </span>
                <button
                  className="p-1 bg-rose-400 block text-white rounded-r-full hover:bg-rose-600"
                  onClick={() => deleteKeyword(idx)}
                >
                  <XMarkIcon className="w-4 h-4 block" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="bg-white p-3 rounded-lg">
            Links
            <VariableIcon className="w-6 h-6 text-blue-500 inline" />
            <div className='flex space-x-1'>
              <input
                className='w-auto border border-slate-200 p-2'
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
            <div className='flex space-x-1 flex-wrap'>
              {promptLinks.map((link, idx) => (
                <div key={idx} className='border border-slate-400 rounded-full flex items-center'>
                  <span className='text-sm leading-none inline-block px-1'>
                    {link.name} - {link.link}
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

        <div className='bg-white rounded-lg p-2 space-y-2'>
          <AdjustmentsVerticalIcon className="w-6 h-6 text-blue-500 inline" />
          <div>
            Instructions
          
          
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full border border-slate-200 p-2"
            />
          </div>
                <div>
            Model
          
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full border border-slate-200 p-2"
            >
              <option value="gpt-4o">gpt-4o</option>
              <option value="gpt-4">gpt-4-turbo</option>
              <option value="gpt-4">gpt-4</option>
          
            </select>
                </div>
          <div>
            Temperature - <span className='w-6 inline-block'>{temperature}</span>
          
            {/* // input range for temperature */}
            <input
              type="range"
              min="0"
              max="2"
              step="0.01"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="w-full px-4">
        <h2>Paste Here (Rich text, Document)</h2>
        <div className="grid grid-cols-2 w-full gap-4">
          <div className="bg-white rounded p-2">
          <CustomEditor
              initialData=''
            />

          </div>
          <div className="bg-white rounded p-2">
            <div>markdown</div>
            <div style={{
              fontFamily: 'monospace',
            }}>
              {markdownContent}
            </div>
          </div>
          <div>
          <button className={`
            ${isLoading ? 'bg-gray-300 animate-pulse' : 'bg-blue-500'}
          
            p-2 text-white rounded text-sm
          `} type='button'
              onClick={handleGenerate}
            >
              {isLoading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>
      </div>

      <div className="w-full px-4">
        <h2>Result</h2>
        <div className="grid grid-cols-2 w-full gap-4">
          <div className="bg-white rounded p-2 prose prose-a:text-blue-600 w-full">
            <ReactMarkdown>
              {value}
            </ReactMarkdown>
          </div>
          <div className="bg-white rounded p-2">
            markdown
            <textarea value={value} className="border-slate-200 border w-full block" />
          </div>

          <div>
           
          </div>
        </div>
      </div>
    </div>
  )
}
