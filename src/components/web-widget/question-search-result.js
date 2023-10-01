import { useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import InlineLoading from '../InlineLoading'

import {
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon,
  ChatBubbleBottomCenterTextIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/solid'
import Loading from '../Loading'
import ReactMarkdown from 'react-markdown'

export default function QuestionSearchResult({ question, isLatest }) {
  const scrollTargetRef = useRef(null)
  const [isOpen, setIsOpen] = useState(isLatest)
  // const [isTyping, setIsTyping] = useState(false)

  // create typing effect for answer

  // const typingEffect = (text) => {
  //   let i = 0;
  //   setIsTyping(true)
  //   const timer = setInterval(() => {
  //     if (i < text.length) {
  //       document.getElementById('answer').innerHTML += text.charAt(i);
  //       i++;
  //     } else {
  //       clearInterval(timer);
  //       setIsTyping(false)
  //     }
  //   }, 50);
  // }

  // const handleScrollIntoView = () => {
  //   setTimeout(() => {
  //     scrollTargetRef.current.scrollIntoView({ behavior: 'smooth' })
  //   }, 100)
  // }

  return (
    <div className="w-full bg-white rounded-lg bg-gradient-to-b from-white to-gray-100/50">
      <div className="flex flex-row justify-between items-center">
        <div className="py-2 px-3 md:p-4 text-base leading-none md:text-lg lg:text-xl font-bold text-left dark:text-white">
          {question.question}
        </div>
        <div className="px-2 py-2 md:px-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-7 h-7 hover:bg-blue-600 text-white duration-200 bg-gray-300 rounded-full flex items-center justify-center"
          >
            <ChevronDownIcon
              className={`w-5 h-5  duration-200 ${
                isOpen ? 'transform rotate-0' : 'transform -rotate-90'
              }`}
            />
          </button>
        </div>
      </div>
      <motion.div
        className={`${
          isOpen ? '' : ''
        } overflow-hidden divide-y divide-gray-300/50 border-t border-gray-300/50 relative`}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="space-y-4 py-4 text-base leading-7 text-gray-600 overflow-y-auto">
          <div className="relative h-full w-full">
            <div className="px-4 relative h-full w-full ">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.5,
                }}
                key={`res-${question.sources.length}`}
                className="flex items-center text-dark-900 font-bold text-blue-400 -mx-1 mb-2"
              >
                <div className="w-auto px-1">
                  {question.sources.length > 0 ? (
                    <div className="w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center">
                      <DocumentTextIcon className="text-white w-4 h-4 inline" />
                    </div>
                  ) : (
                    <InlineLoading />
                  )}
                </div>
                <div className="w-auto px-1">Resources / Search results</div>
              </motion.div>
              <AnimatePresence>
                <div
                  className="flex flex-wrap -mx-1 min-h-[100px]"
                  key={`sources`}
                >
                  {question.sources &&
                    question.sources.map((item, idx) => {
                      return (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{
                            duration: 0.5,
                            delay: idx * 0.2,
                          }}
                          className="w-1/2 lg:w-1/4 px-1 mb-2 overflow-hidden"
                          key={`res-${idx}`}
                        >
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded hover:bg-gray-100 bg-gray-100/50 p-2 group block"
                          >
                            <p className="text-[10px]">
                              Resource #{++idx} | {item.score}
                            </p>
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

                {question.answer && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 0.5,
                        delay: 1,
                      }}
                      key={`res-answer`}
                      className="flex items-center text-dark-900 font-bold text-blue-400 -mx-1 mb-2"
                    >
                      <div className="w-auto px-1">
                        <div className="w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center">
                          <ChatBubbleBottomCenterTextIcon className="text-white w-4 h-4 inline" />
                        </div>
                      </div>
                      <div className="w-auto px-1">Answer</div>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{
                        duration: 0.5,
                        delay: 1,
                      }}
                      className="grow"
                      key={`res-answer-content`}
                    >
                      {question.answer.indexOf('</') >= 0 ? (
                        <div
                          className="prose prose-img:rounded-xl prose-headings:underline prose-a:text-blue-600"
                          dangerouslySetInnerHTML={{
                            __html: question.answer,
                          }}
                        />
                      ) : (
                        <div className="prose prose-img:rounded-xl prose-headings:underline prose-a:text-blue-600">
                          <ReactMarkdown>{question.answer}</ReactMarkdown>
                        </div>
                      )}
                    </motion.div>
                    <div ref={scrollTargetRef}></div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}