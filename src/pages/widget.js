import React, { useContext, useRef, useState, useReducer } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import Image from 'next/image'

import {
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon,
  ChatBubbleBottomCenterTextIcon,
} from '@heroicons/react/24/solid'

import Loading from '../components/Loading'

const initialState = {
  question: '',
  isLoading: false,
  isSubmitted: false,
  answer: '',
  sources: [],
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_QUESTION':
      return { ...state, question: action.question }
    case 'SET_ANSWER':
      return {
        ...state,
        answer: action.answer,
        isLoading: action.isLoading,
        isSubmitted: true,
      }
    case 'SET_RESOURCES':
      return {
        ...state,
        sources: action.sources,
      }
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading }
    case 'RESET':
      return {
        ...state,
        question: '',
        answer: '',
        isSubmitted: false,
        sources: [],
      }
    default:
      return state
  }
}

export default function ChatWidget() {
  // const {resources, setResources} = useResourcesContext();
  const myHeaders = new Headers()
  myHeaders.append('Content-Type', 'application/json')

  const [state, dispatch] = useReducer(reducer, initialState)

  const askQuestion = async (e) => {
    e.preventDefault()
    if (state.question.length === 0) {
      return
    }
    dispatch({ type: 'SET_LOADING', isLoading: true })

    const questionRequestOptions = {
      method: 'POST',

      headers: myHeaders,
      body: JSON.stringify({
        question: state.question,
      }),
      redirect: 'follow', // manual, *follow, error
    }

    const { sources, prompt } = await fetch(
      '/api/openai/embedding',
      questionRequestOptions
    )
      .then((response) => {
        if (response.status === 200) {
          console.log('post success')
          console.log(response)
        }
        return response.json()
      })
      .then((result) => result)
      .catch((error) => console.log('error', error))

    dispatch({
      type: 'SET_RESOURCES',
      sources: sources,
    })

    const promptRequestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        prompt: prompt,
      }),
      redirect: 'follow', // manual, *follow, error
    }

    const { completion } = await fetch(
      '/api/openai/completion',
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
      .catch((error) => console.log('error', error))

    dispatch({
      type: 'SET_ANSWER',
      answer: completion,
      isLoading: false,
    })
  }

  const scrollTargetRef = useRef(null)
  // const intialMesages = [
  //   {
  //     role: "user",
  //     content: "Hi, what is websitebot?",
  //   },
  //   {
  //     role: "bot",
  //     content:
  //       "WebsiteBot is a software application designed to perform automated tasks on websites.",
  //   },
  // ];
  // const [messages, setMessages] = useState(intialMesages);

  // const handleSubmitMessage = (e) => {
  //   e.preventDefault();
  //   const message = e.target.message.value;
  //   if (!message) {
  //     return;
  //   }

  //   setMessages([...messages, { role: "user", content: message }]);
  //   e.target.message.value = "";
  //   setTimeout(() => {
  //     scrollTargetRef.current.scrollIntoView({ behavior: "smooth" });
  //   }, 100);
  // };

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="relative bg-white w-full max-w-[720px] mx-auto rounded-lg">
        <p className="p-4 text-xl font-bold text-left">
          {state.isSubmitted && state.question}{' '}
        </p>
        <div className="divide-y divide-gray-300/50 border-t border-gray-300/50 relative">
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
          <div className="space-y-6 py-8 text-base leading-7 text-gray-600 h-[600px] overflow-y-auto">
            {/* {JSON.stringify(state)} */}

            <div className="relative h-full w-full">
              <div className="px-4 relative h-full w-full">
                <AnimatePresence>
                  {state.sources.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 0.5,
                      }}
                      key={`res-${state.sources.length}`}
                      className="flex items-center text-dark-900 font-bold text-sky-600 -mx-1"
                    >
                      <div className="w-auto px-1">
                        <div className="w-6 h-6 rounded-full bg-sky-600 flex items-center justify-center">
                          <DocumentTextIcon className="text-white w-4 h-4 inline" />
                        </div>
                      </div>
                      <div className="w-auto px-1">
                        Resources / Search results
                      </div>
                    </motion.div>
                  )}
                  <div className="flex flex-wrap -mx-1">
                    {state.sources &&
                      state.sources.map((item, idx) => {
                        return (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{
                              duration: 0.5,
                              delay: idx * 0.2,
                            }}
                            className="w-1/4 px-1 mb-2 overflow-hidden"
                            key={`res-${idx}`}
                          >
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded hover:bg-gray-100 bg-gray-100/50 p-2 group block"
                            >
                              <p className="text-[10px]">Resource #{++idx}</p>
                              <p className="text-sm">{item.title}</p>
                              <p className="text-xs">{item.url}</p>
                              <p className="text-blue-600 text-xs">
                                <span className="group-hover:underline">
                                  Read more{' '}
                                  <ArrowTopRightOnSquareIcon className="w-3 h-3 inline" />
                                </span>
                              </p>
                            </a>
                          </motion.div>
                        )
                      })}
                  </div>
                  <div key={'loading'} ref={scrollTargetRef}>
                    {state.isLoading && <Loading />}
                  </div>

                  {state.answer && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: 0.5,
                        }}
                        key={`res-answer`}
                        className="flex items-center text-dark-900 font-bold text-sky-600 -mx-1"
                      >
                        <div className="w-auto px-1">
                          <div className="w-6 h-6 rounded-full bg-sky-600 flex items-center justify-center">
                            <ChatBubbleBottomCenterTextIcon className="text-white w-4 h-4 inline" />
                          </div>
                        </div>
                        <div className="w-auto px-1">Answer</div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: 0.5,
                        }}
                        className="grow pb-4"
                        key={`res-answer-content`}
                      >
                        {state.answer.indexOf('</') >= 0 ? (
                          <div
                            className="prose prose-img:rounded-xl prose-headings:underline prose-a:text-blue-600"
                            dangerouslySetInnerHTML={{ __html: state.answer }}
                          />
                        ) : (
                          <div className="prose prose-img:rounded-xl prose-headings:underline prose-a:text-blue-600">
                            <ReactMarkdown>{state.answer}</ReactMarkdown>
                          </div>
                        )}

                        {/* <textarea
                        readOnly
                        className="mt-1 bg-white/50 w-full outline-none"
                        rows={20}
                        value={state.answer}
                      ></textarea> */}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-b-lg">
          <form
            onSubmit={askQuestion}
            className="p-4 flex gap-2 text-base font-semibold leading-7"
          >
            <input
              name="message"
              onChange={(e) =>
                dispatch({
                  type: 'SET_QUESTION',
                  question: e.target.value,
                })
              }
              value={state.question || ''}
              placeholder="Ask Kruze anything"
              className="px-2 py-1.5 border rounded-md flex-1 font-normal focus:outline-none focus:border-gray-400"
            />
            <button className="bg-gray-600 px-2.5 rounded-md text-white">
              {/* prettier-ignore */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" x2="11" y1="2" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
