import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { Toaster } from 'react-hot-toast'

import Layout from '@/components/layout'

import { ArrowPathIcon } from '@heroicons/react/24/solid'

import InlineLoading from '@/components/InlineLoading'
import QuestionSearchResult from '../components/web-widget/question-search-result'
import FilterControls from '@/components/common/filter-controls'

import { usedModel } from '../../utils/hardcoded'
import { sourceFilters, typeFilters } from '../../utils/hardcoded'

import { useQuestions } from '@/hooks/useQuestions'
import { useQAAPI } from '@/hooks/useAPI'

export default function ChatWidget() {
  // Custom hooks
  const {
    questions,
    isSubmitted,
    addQuestion,
    updateQuestionSources,
    updateQuestionAnswer,
    handleLike,
    handleDislike,
    handleReport,
    clearQuestions,
  } = useQuestions()

  const {
    isLoading,
    setIsLoading,
    getEmbeddingAndPrompt,
    getCompletion,
  } = useQAAPI()

  const [question, setQuestion] = useState('')

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

  const askQuestion = async (e) => {
    e.preventDefault()
    if (question.length === 0) {
      return
    }

    const questionIndex = questions.length
    addQuestion(question)
    
    // Set attempt date and clear input
    setQuestion('')
    if (window.gtag !== undefined) {
      console.log('gtag')
    }
    
    handleScrollIntoView()
    setIsLoading(true)

    // Get embedding and sources
    const { sources, prompt } = await getEmbeddingAndPrompt(
      question, 
      filterBySourceArray, 
      filterByTypeArray
    )

    // Update question with sources
    updateQuestionSources(questionIndex, sources)
    handleScrollIntoView()

    // Get completion
    const completion = await getCompletion(prompt, usedModel)

    // Update question with answer
    updateQuestionAnswer(questionIndex, completion)

    setIsLoading(false)
    handleScrollIntoView()
  }

  return (
    <Layout>
      <div className=" min-h-screen flex items-center justify-center relative">
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
        <div className="relative overflow-auto pb-40 w-full max-w-[720px] mx-auto flex flex-col justify-start items-center">
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
              <div className="bg-[#6c757d] md:rounded-lg relative z-10 md:border border-slate-200">
                <div className="">
                  <form
                    onSubmit={askQuestion}
                    className="p-4 flex gap-2 text-base font-semibold leading-7 relative"
                  >
                    <FilterControls
                      filterBySourceArray={filterBySourceArray}
                      setFilterBySourceArray={setFilterBySourceArray}
                      filterByTypeArray={filterByTypeArray}
                      setFilterByTypeArray={setFilterByTypeArray}
                      sourceFilters={sourceFilters}
                      typeFilters={typeFilters}
                    />

                    <input
                      name="message"
                      onChange={(e) => {
                        setQuestion(e.target.value)
                      }}
                      value={question || ''}
                      placeholder="Kruze AI - Ask a question"
                      className="px-2 py-1.5 border rounded-md flex-1 font-normal focus:outline-none focus:border-gray-400"
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

                  {questions.length > 0 && (
                    <div className="px-4 py-2 relative z-10 border-t border-white">
                      <div className="flex text-xs justify-center">
                        <button
                          type="button"
                          className="border-b text-white border-white hover:border-dashed"
                          onClick={() => clearQuestions()}
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
      </div>
    </Layout>
  )
}
