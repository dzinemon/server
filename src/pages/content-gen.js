import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'

import Layout from '@/components/layout'

import { ArrowPathIcon } from '@heroicons/react/24/solid'

import QuestionSearchResult from '../components/web-widget/question-search-result'
import InlineLoading from '@/components/InlineLoading'

const questionExamples = [
  'Is QuickBooks good for SaaS Startups?',
  'What is the best accounting software for SaaS startups?',
  'What taxes should I pay as a Delaware C-corp startup?',
  'How much time do you spend monthly doing bookkeeping?',
  'Who are good bookkeepers in Mountain View CA?',
  'Which tools should every startup CFO know/use?',
]

const searchExamples = [
  'Kruze Pricing',
  'Startup Taxes',
  'Startup Bookkeeping',
  'C-Corp Tax Deadlines 2023',
  '409A Valuation',
  'Top pre-seed funds',
]

export default function ChatWidget() {
  // const [limitReached, setLimitReached] = useState(false)

  const [response, setResponse] = useState({})
  const scrollTargetRef = useRef(null)
  const [isAccepted, setIsAccepted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [question, setQuestion] = useState('')
  const [questions, setQuestions] = useState([])

  const myHeaders = new Headers()
  myHeaders.append('Content-Type', 'application/json')

  const handleLike = (question) => {
    // console.log('like', question)
    // update questions with like

    const questions = JSON.parse(localStorage.getItem('localQuestions'))

    const updatedQuestions = questions.map((item) => {
      if (item.question === question.question) {
        return {
          ...item,
          like: true,
          dislike: false,
        }
      }
      return item
    })

    setQuestions(updatedQuestions)
    localStorage.setItem('localQuestions', JSON.stringify(updatedQuestions))
  }

  const handleDislike = (question) => {
    // console.log('dislike', question)
    // update questions with dislike

    const questions = JSON.parse(localStorage.getItem('localQuestions'))

    const updatedQuestions = questions.map((item) => {
      if (item.question === question.question) {
        return {
          ...item,
          dislike: true,
          like: false,
        }
      }
      return item
    })

    setQuestions(updatedQuestions)
    localStorage.setItem('localQuestions', JSON.stringify(updatedQuestions))
  }

  const handleReport = (question, report) => {
    // console.log('report', question)
    // update questions with report

    const questions = JSON.parse(localStorage.getItem('localQuestions'))

    const updatedQuestions = questions.map((item) => {
      if (item.question === question.question) {
        return {
          ...item,
          report: report,
        }
      }
      return item
    })

    setQuestions(updatedQuestions)
    localStorage.setItem('localQuestions', JSON.stringify(updatedQuestions))
  }


  const handleSetQuestionsFromLocalStorage = () => {
    // read localstorage for questions
    const questions = JSON.parse(localStorage.getItem('localQuestions'))
    if (questions && questions.length > 0) {
      setQuestions(questions)
      setIsSubmitted(true)
    }
  }

  useEffect(() => {
    // handle localstorage for attempt count and date
    
    
    handleSetQuestionsFromLocalStorage()
  }, [])

  const handleClearLocalStorage = () => {
    localStorage.removeItem('localQuestions')
    setIsSubmitted(false)

    setQuestions([])
  }

  const handleScrollIntoView = () => {
    setTimeout(() => {
      scrollTargetRef.current.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const askQuestion = async (e) => {
    
    e.preventDefault()
    if (question.length === 0) {
      return
    }
    let currentQuesiton = { question: question, answer: '', sources: [] }
    setQuestions(questions.concat([currentQuesiton]))
    // set attempt date to now
    setQuestion((prev) => {
      if (window.gtag !== undefined) {
        console.log('gtag')
      }
      return ''
    })
    handleScrollIntoView()

    setIsLoading(true)

    setIsSubmitted(true)

    // push current question to array of questions

    const questionRequestOptions = {
      method: 'POST',

      headers: myHeaders,
      body: JSON.stringify({
        question: question,
        subQuestions: questions.map((item) => item.question),
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

    // update current question resources

    setQuestions((previous) => {
      return [
        ...previous.slice(0, -1),
        {
          ...previous[previous.length - 1],
          sources,
        },
      ]
    })

    handleScrollIntoView()

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

    // update current question answer

    setQuestions((previous) => {
      const currentQuestions = [
        ...previous.slice(0, -1),
        {
          ...previous[previous.length - 1],
          answer: completion,
        },
      ]

      localStorage.setItem('localQuestions', JSON.stringify(currentQuestions))
      localStorage.setItem('lastAttempt', new Date())

      return currentQuestions
    })

    // save question answer to db

    setIsLoading(false)

    handleScrollIntoView()
    
  }


  useEffect(() => {
    // handle localstorage for attempt count and date
    
    
    handleSetQuestionsFromLocalStorage()
  }, [])
  
  return (
    <Layout>
      <div className=" flex items-center justify-center relative">
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
        <div className="relative overflow-auto pb-28 w-full max-w-[720px] mx-auto flex flex-col justify-start items-center">
          <motion.div
            className={`${
              isSubmitted ? 'h-full' : 'h-0'
            } w-full overflow-auto space-y-3 lg:space-y-4 px-4 `}
            layout
          >
            {questions.length > 0
              ? questions.map((item, idx, arr) => {
                  return (
                    <QuestionSearchResult
                      handleLike={() => {
                        handleLike(item)
                      }}
                      handleDislike={() => {
                        handleDislike(item)
                      }}
                      handleReport={handleReport}
                      question={item}
                      key={`qsr-${idx}`}
                      isLatest={idx === arr.length - 1}
                    />
                  )
                })
              : ''}
            <div key={'loading'} ref={scrollTargetRef}></div>
          </motion.div>
          {/* FORM */}
          <AnimatePresence>
            <motion.div
              key={'form-div'}
              // animate positionin top and bottom
              animate={{
                bottom: isSubmitted ? '16px' : 'auto',
                top: isSubmitted ? 'auto' : '0px',
              }}
              className={`${
                isSubmitted ? 'fixed bottom-2' : 'relative'
              } w-full max-w-[720px]`}
            >
              <div className="md:bg-gray-50 md:rounded-lg relative z-10 md:border border-slate-200">
                <div>
                    <form
                      onSubmit={askQuestion}
                      className="p-4 flex gap-2 text-base font-semibold leading-7 relative"
                    >
                      <input
                        name="message"
                        onChange={(e) => {
                          setQuestion(e.target.value)
                        }}
                        value={question || ''}
                        placeholder="Ask Kruze anything"
                        className="px-2 py-1.5 border rounded-md flex-1 font-normal focus:outline-none focus:border-gray-400"
                      />
                      <button
                        disabled={isLoading}
                        id="submit-question"
                        className={`bg-blue-400 hover:bg-blue-600 delay-100 duration-500 px-2.5 rounded-md text-white relative
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
                    {questions.length > 0 && (
                      <div className="px-4 py-2 relative z-10">
                        <div className="flex text-xs justify-center">
                          <button
                            type="button"
                            className="border-b border-gray-600 hover:border-dashed"
                            onClick={() => handleClearLocalStorage()}
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
          <AnimatePresence>
            <motion.div
              key={'examples-div'}
              className="w-full overflow-hidden space-y-4 pt-4"
              layout
              // animate={{ opacity: 1 }}
              transition={{
                // opacity: { ease: "linear" },
                layout: { duration: 0.3 },
              }}
              style={{ height: isSubmitted ? '0px' : 'auto' }}
            >
              <p className="text-center text-gray-800 text-base max-w-xl mx-auto">
                {/* ask any question, or pick up one below */}
                Search any term or question to access comprehensive resources and
                detailed information from Kruze Consulting.
              </p>
              <div className="space-y-2">
                <p className="text-center text-gray-600 text-sm"></p>
                <p className="text-center text-gray-600 text-sm">
                  Can`t think of a question? Choose one of the frequently asked
                  questions or search terms below.
                </p>
              </div>
              <div className="flex flex-wrap justify-center items-center -mx-1">
                {questionExamples
                  .concat(searchExamples)
                  .sort()
                  .map((item, idx) => {
                    return (
                      <div className="px-1 mb-1" key={`question-${idx}`}>
                        <button
                          className=" bg-white text-xs rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900
                        "
                          onClick={() => {
                            setQuestion(item)
                          }}
                        >
                          {item}
                        </button>
                      </div>
                    )
                  })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  )
}
