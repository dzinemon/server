import React, { useContext, useRef, useState, useReducer } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import Image from 'next/image'

import {
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon,
  ChatBubbleBottomCenterTextIcon,
} from '@heroicons/react/24/solid'

import QuestionSearchResult from '../components/web-widget/question-search-result'
import Loading from '../components/Loading'

const questionExamples = [
  'Is QuickBooks good for SaaS Startups?',
  'What is the best accounting software for SaaS startups?',
  'What taxes should I pay as a Delaware C-corp startup?',
  'How much time do you spend monthly doing bookkeeping?',
  'Who are good bookkeepers in Mountain View CA?',
  'Which tools should every startup CFO know/use?',
]

const question = {
  q: '',
  answer: '',
  sources: [],
}

const initialState = {
  question: '',
  questions: [],
  isLoading: false,
  isSubmitted: false,
}

export default function ChatWidget() {
  // const {resources, setResources} = useResourcesContext();
  const scrollTargetRef = useRef(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [question, setQuestion] = useState('')
  const [questions, setQuestions] = useState([])

  const myHeaders = new Headers()
  myHeaders.append('Content-Type', 'application/json')

  const handleButtonAnimation = () => {
    const button = document.getElementById('submit-question')
    button.classList.add(
      'after:animate-ping',
      'after:opacity-100',
      'after:blur-md'
    )
    setTimeout(() => {
      button.classList.remove(
        'after:animate-ping',
        'after:opacity-100',
        'after:blur-md'
      )
    }, 1000)
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

    setIsLoading(true)

    setIsSubmitted(true)

    // push current question to array of questions

    setQuestions(questions.concat([currentQuesiton]))

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
      return [
        ...previous.slice(0, -1),
        {
          ...previous[previous.length - 1],
          answer: completion,
        },
      ]
    })

    // setQuestions(
    //   questions.slice(0, -1).concat([
    //     {
    //       sources: sources,
    //       question: question,
    //       answer: completion,
    //     },
    //   ])
    // )
    setIsLoading(false)
    setQuestion('')
    handleScrollIntoView()
  }

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
    <div className="h-screen w-screen  flex items-center justify-center relative">
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
      <div className="relative overflow-auto pt-4 pb-28 w-full h-screen max-w-[720px] mx-auto flex flex-col justify-center items-center">
        <motion.div
          className={`${
            isSubmitted ? 'h-full' : 'h-0'
          } w-full  overflow-auto space-y-4`}
          layout
        >
          {questions.length > 0
            ? questions.map((item, idx, arr) => {
                return (
                  <QuestionSearchResult
                    question={item}
                    key={`qsr-${idx}`}
                    isLatest={idx === arr.length - 1}
                  />
                )
              })
            : ''}

          <div key={'loading'} ref={scrollTargetRef}></div>
        </motion.div>

        {/* {JSON.stringify(questions, null, 2)} */}
        {isLoading && <Loading />}

        {/* FORM */}
        <motion.div
          key={'form-div'}
          className={`${
            isSubmitted ? 'fixed bottom-4' : 'relative'
          } w-full max-w-[720px] bg-gray-100 rounded-lg`}
        >
          <form
            onSubmit={askQuestion}
            className="p-4 flex gap-2 text-base font-semibold leading-7"
          >
            <input
              name="message"
              onChange={(e) => {
                setQuestion(e.target.value)
                handleButtonAnimation()
              }}
              value={question || ''}
              placeholder="Ask Kruze anything"
              className="px-2 py-1.5 border rounded-md flex-1 font-normal focus:outline-none focus:border-gray-400"
            />
            <button
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
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className='z-10 relative'
              >
                <line x1="22" x2="11" y1="2" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </motion.div>

        {/* EXAMPLES */}
        <AnimatePresence>
          <motion.div
            key={'examples-div'}
            className="w-full overflow-hidden"
            layout
            // animate={{ opacity: 1 }}
            transition={{
              // opacity: { ease: "linear" },
              layout: { duration: 0.3 },
            }}
            style={{ height: isSubmitted ? '0px' : 'auto' }}
          >
            <p className="text-center text-gray-600 my-4 text-sm">
              ask any question, or pick up one below
            </p>
            <div className="flex flex-wrap justify-center items-center -mx-1">
              {questionExamples.map((item, idx) => {
                return (
                  <div className="px-1 mb-1" key={`question-${idx}`}>
                    <button
                      className=" bg-blue-100 text-xs rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-300 hover:text-gray-700
                      "
                      onClick={() => {
                        setQuestion(item)
                        handleButtonAnimation()
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
  )
}
