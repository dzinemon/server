import { useEffect, useReducer } from 'react'
import Layout from '../components/layout'
import {
  QuestionMarkCircleIcon,
  InformationCircleIcon,
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

export default function AskQuestion() {
  const myHeaders = new Headers()
  myHeaders.append('Content-Type', 'application/json')

  const [state, dispatch] = useReducer(reducer, initialState)

  const handleReset = (e) => {
    e.preventDefault()
    dispatch({ type: 'RESET' })
  }

  const askQuestion = async (e) => {
    dispatch({ type: 'SET_LOADING', isLoading: true })
    e.preventDefault()

    const postRequestOptions = {
      method: 'POST',

      headers: myHeaders,
      body: JSON.stringify({
        question: state.question,
      }),
      redirect: 'follow', // manual, *follow, error
    }

    const aiResponse = await fetch('/api/openai', postRequestOptions)
      .then((response) => {
        if (response.status === 200) {
          console.log('post success')
          console.log(response)
        }
        return response.json()
      })
      .then((result) => result)
      .catch((error) => console.log('error', error))

    console.log('aiResponse', aiResponse)

    dispatch({
      type: 'SET_ANSWER',
      answer: aiResponse.answer,
      sources: aiResponse.sources,
      isLoading: false,
    })
  }

  const title = 'Ask question'
  const subtitle = ''

  useEffect(() => {
    const openAiContentDiv = document.getElementById('openAiContent')
    if (openAiContentDiv) {
      openAiContentDiv.innerHTML = state.answer
    }
  }, [state])

  return (
    <Layout>
      <div className="relative isolate overflow-hidden py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <h2 className="text-4xl font-bold tracking-tight sm:text-6xl text-center">
            {title}
          </h2>
          <p className="mt-6 text-lg leading-8 opacity-60">{subtitle}</p>
        </div>

        <div className="container max-w-2xl py-12">
          <form onSubmit={askQuestion}>
            <div className="space-y-12">
              <div className="border-b border-gray-900/10 pb-12">
                <h2 className="text-base font-semibold leading-7 text-gray-900">
                  Ask a question to Knowledge base
                </h2>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  {/* {JSON.stringify(state.rawAnswer, null, 2)} */}
                </p>
                <div className="mt-10">
                  <div className="">
                    <div className="mt-2 space-y-4">
                      <div>
                        <label
                          htmlFor="text"
                          className="block text-sm font-medium leading-6 text-gray-900"
                        >
                          <QuestionMarkCircleIcon className="text-gray-600 w-5 h-5 inline" />
                          Ask a Question
                        </label>
                        <textarea
                          onChange={(e) =>
                            dispatch({
                              type: 'SET_QUESTION',
                              question: e.target.value,
                            })
                          }
                          rows={5}
                          id="text"
                          value={state.question}
                          className="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        ></textarea>
                      </div>

                      <div className="flex justify-between">
                        <button
                          type="submit"
                          className=" w-auto whitespace-nowrap rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                          Ask Question
                        </button>
                        <button
                          className=" w-auto whitespace-nowrap rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                          type="button"
                          onClick={handleReset}
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>

          <p className="mt-1 text-sm leading-6 text-gray-600">
            {state.isLoading && <Loading />}
            {state.isSubmitted && !state.isLoading && state.question}
          </p>

          <p className="block mt-6 text-sm font-medium leading-6 text-gray-900">
            {state.isSubmitted && !state.isLoading && (
              <>
                <InformationCircleIcon className="text-gray-600 w-5 h-5 inline" />
                Answer:
              </>
            )}
          </p>
          <div className="p-4 mt-1 rounded-md bg-white/50">
            <div id="openAiContent"></div>

            {state.isSubmitted && (
              <div className="opacity-60 italic border-t border-gray-400 pt-2 mt-2 text-sm">
                Length: {state.answer.length}
              </div>
            )}

            {state.sources.length > 0 && (
              <div className="mt-4">
                <p>Resources:</p>
                <ul className="list-disc list-inside ">
                  {state.sources.map((source, idx) => {
                    return (
                      <li className="mt-2" key={`source-${idx}`}>
                        <a
                          href={source.url}
                          target="_blank"
                          className="hover:opacity-70 text-blue-600"
                        >
                          {source.title}
                        </a>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
