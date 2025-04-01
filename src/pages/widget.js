import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'

import { useRouter } from 'next/router'

import toast, { Toaster } from 'react-hot-toast';

import Script from 'next/script'

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
  'C-Corp Tax Deadlines 2025',
  '409A Valuation',
  'Top pre-seed funds',
]

const limitSearchAttempts = 20

const NEXT_PUBLIC_GA4_ID = process.env.NEXT_PUBLIC_GA4_ID

export default function ChatWidget() {
  // const [limitReached, setLimitReached] = useState(false)
  const router = useRouter()
  const [response, setResponse] = useState({})
  const scrollTargetRef = useRef(null)
  const [isAccepted, setIsAccepted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [question, setQuestion] = useState(
    router.query.question ? router.query.question : ''
  )
  const [questions, setQuestions] = useState([])

  const [attemptCount, setAttemptCount] = useState(0)
  const [attemptDate, setAttemptDate] = useState('')

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

  const handleGetAttemtCountLocalStorage = () => {
    const localStorageAttemptCount = localStorage.getItem('attemptCount')  === null ? 0 : localStorage.getItem('attemptCount')
    const localStorageAttemptDate = localStorage.getItem('lastAttempt')

    // console.log('localStorageAttemptCount', localStorageAttemptCount)
    // console.log('localStorageAttemptDate', localStorageAttemptDate)

    const dateNow = new Date()

    const latestDate = new Date(localStorageAttemptDate)

    const dateDiff = Math.abs(dateNow - latestDate)
    // console.log('dateDiff', dateDiff)
    const diffHours = Math.ceil(dateDiff / (1000 * 60 * 60))

    // console.log('diffHours', diffHours)
    // console.log('diffDays', diffDays)

    if (localStorageAttemptDate && diffHours > 24) {
      // console.log('resetting attempt count')
      handleClearLocalStorageDateCount()
    } else {
      setAttemptCount(parseInt(localStorageAttemptCount))
      setAttemptDate(localStorageAttemptDate)
    }
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
    // makeRequest()
    handleGetAttemtCountLocalStorage()
    handleSetQuestionsFromLocalStorage()
  }, [])

  const handleClearLocalStorage = () => {
    localStorage.removeItem('localQuestions')
    setIsSubmitted(false)

    setQuestions([])
  }

  function handleClearLocalStorageDateCount() {
    localStorage.removeItem('attemptCount')
    localStorage.removeItem('lastAttempt')
    setAttemptCount(0)
    setAttemptDate('')
  }

  const handleScrollIntoView = () => {
    setTimeout(() => {
      scrollTargetRef.current.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleSendGoogleAnalyticsEvent = (question) => {
    window.gtag('event', 'search_widget', {
      search_term: question,
    })
    if (typeof(dataLayer) === 'object') {
      dataLayer.push({
        'event': 'extSearch',
        'searchTerm': question
      });
    } else {
      console.log('GA is not a function');
    }
  }

  const handleSaveQuestionAnswer = async (question, answer, resources) => {
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        question: question,
        answer: answer,
        resources: resources,
      }),
      redirect: 'follow', // manual, *follow, error
    }

    const result = await fetch('/api/questions', requestOptions)
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
        // makeRequest()
      })

    console.log('result', result)
  }

  const askQuestion = async (e) => {
    // console.log('attemptCount', attemptCount)
    router.query = {}
    e.preventDefault()
    if (question.length === 0) {
      return
    }
    let currentQuesiton = { question: question, answer: '', sources: [] }
    if (window.gtag !== undefined) {
      handleSendGoogleAnalyticsEvent(question)
    }
    setQuestions(questions.concat([currentQuesiton]))
    setAttemptCount(attemptCount + 1)
    // set attempt date to now
    setAttemptDate(new Date())
    setQuestion((prev) => {
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
        sourceFilters: ['website'],
        typeFilters: ['webpage', 'post', 'tip', 'tax_calendar', 'qna'],
        topK: 8,
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
      .catch((error) => {
        console.log('error', error)
        toast('Error generating embedding',
          {
            icon: '❌',
          }
        )
        setIsLoading(false)
        setQuestions((previous) => {
          return previous.slice(0, -1)
        }
        )
      })

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
      .catch((error) =>  {
        console.log('error', error)
        toast('Error generating completion',
          {
            icon: '❌',
          }
        )
        setIsLoading(false)
        setQuestions((previous) => {
          return previous.slice(0, -1)
        })
        
      }
      )

    // update current question answer

    setQuestions((previous) => {
      const currentQuestions = [
        ...previous.slice(0, -1),
        {
          ...previous[previous.length - 1],
          answer: completion,
        },
      ]

      // console.log('attemptCount', attemptCount)

      localStorage.setItem('localQuestions', JSON.stringify(currentQuestions))
      localStorage.setItem('attemptCount', attemptCount + 1)
      localStorage.setItem('lastAttempt', new Date())

      return currentQuestions
    })

    // save question answer to db
    await handleSaveQuestionAnswer(
      question,
      completion,
      JSON.stringify(sources)
    )

    setIsLoading(false)

    handleScrollIntoView()
    // makeRequest()
  }

  useEffect(() => {
    // handle localstorage for attempt count and date
    // makeRequest()
    handleGetAttemtCountLocalStorage()
    handleSetQuestionsFromLocalStorage()
  }, [])

  useEffect(() => {
    // router query question
    if (router.query.question) {
      setQuestion(router.query.question)
    }
  }
  , [router.query.question])
  
  return (
    <div className="h-screen w-screen  flex items-center justify-center relative">
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
      {/* <div className="absolute  left-4 bottom-4 rounded border p-3 bg-white text-[9px]">
        {Object.keys(response).length > 0 ? (
          <div>
            <div>limit: {response.limit}</div>
            <div>remaining: {response.remaining}</div>
            <div>attemptCount: {attemptCount}</div>
            <div>status: {response.status}</div>
            <div>body: {JSON.stringify(response.body)}</div>
          <hr />
          <button
            onClick={() => {
              makeRequest()
            }}
          >makeRequest</button>
          </div>
        ) : (
          ''
        )}
      </div> */}

      <div className="relative overflow-auto pt-8 lg:pt-4 pb-28 w-full h-screen max-w-[720px] mx-auto flex flex-col justify-start items-center">
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
              {response.status === 429 ||
              limitSearchAttempts < questions.length ? (
                <div className="py-3 text-center text-sm text-slate-400">
                  <p className="">Search Limit Reached.</p>
                  <p>Please try again later.</p>
                  <div className="hidden">
                    {/* <div>limitReached: {JSON.stringify(limitReached)}</div> */}
                    <div>
                      {' '}
                      questions exceeded:{' '}
                      {JSON.stringify(limitSearchAttempts < questions.length)}
                    </div>
                  </div>
                </div>
              ) : (
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
                        {/* <button
        type="button"
        className="border-b border-gray-600 hover:border-dashed"
        onClick={() => handleClearLocalStorageDateCount()}
      >
        <ArrowPathIcon className="inline-block mr-2 w-3.5 h-3.5" />
        Clear Date & Count
      </button> */}
                        {/* <span className='px-2'>
          attemptCount: {attemptCount} attemptDate: {JSON.stringify(attemptDate)}
        </span> */}
                      </div>
                    </div>
                  )}
                </div>
              )}
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

      {!isAccepted && !question && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: isAccepted ? 0 : 1 }}
          transition={{ duration: 0.5 }}
          className={`${
            !questions && 'hidden'
          } absolute z-10 inset-0 flex items-start justify-center backdrop-blur bg-white/10 p-6`}
        >
          <div className="max-w-lg p-4 rounded-lg border border-slate-400 bg-white text-center">
            <p>
              This is an experiential AI-driven question and answer tool. Do not
              rely on these responses, always consult with your CPA, tax
              advisor, accountant or lawyer.
            </p>
            <button
              onClick={() => {
                setIsAccepted(true)
              }}
              className="bg-blue-400 hover:bg-blue-600 duration-200 px-2.5 py-1 rounded-md text-white inline-block mt-2"
            >
              Got it!
            </button>
          </div>
        </motion.div>
      )}

      {NEXT_PUBLIC_GA4_ID !== '' ? (
        <>
          <Script
            id="google-tag-manager"
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${NEXT_PUBLIC_GA4_ID}`}
          ></Script>
          <Script id="google-analytics">
            {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${NEXT_PUBLIC_GA4_ID}', { 'cookieFlags': 'SameSite=None; Secure' });`}
          </Script>
        </>
      ) : (
        ''
      )}
    </div>
  )
}
