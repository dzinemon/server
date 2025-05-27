import { useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import InlineLoading from './InlineLoading'
import { Fragment } from 'react'
import { Menu } from '@headlessui/react'
import CopyToClipboard from './copy-to-clipboard'

const links = [
  { val: 'innacurate', label: 'Inaccurate' },
  { val: 'not-helpful', label: 'Is not helpful' },
]

import {
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon,
  ChatBubbleBottomCenterTextIcon,
  ChevronDownIcon,
  DocumentChartBarIcon,
  CalendarIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  MicrophoneIcon,
} from '@heroicons/react/24/solid'

import ReactMarkdown from 'react-markdown'

import { Type } from './common/resourcetype'

export default function QuestionListItem({ question, onClick, id }) {
  const [isOpen, setIsOpen] = useState(false)

  const [isToDelete, setIsToDelete] = useState(false)

  let strippedString = question.answer.replace(/(<([^>]+)>)/gi, '')

  const resources = JSON.parse(question.resources)

  // return (
  //   <div className='py-40'>
  //     {JSON.stringify(question)}
  //   </div>
  // )

  return (
    <div className="w-full bg-white rounded-lg bg-gradient-to-b from-white to-gray-100/50">
      <div className="flex flex-row justify-between items-center">
        <div className="py-2 px-3 md:p-4 text-base leading-none md:text-lg lg:text-xl font-bold text-left text-gray-900">
          <span className="opacity-60">#{id}</span> - {question.question}
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
                key={`res-${resources.length}`}
                className=" flex items-center text-dark-900 font-bold text-blue-400 -mx-1 mb-2"
              >
                <div className="w-auto px-1">
                  {resources.length > 0 ? (
                    <div className="w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center">
                      <DocumentTextIcon className="text-white w-4 h-4 inline" />
                    </div>
                  ) : (
                    <InlineLoading />
                  )}
                </div>
                <div className="w-auto px-1 text-base lg:text-lg">
                  Resources
                </div>
              </motion.div>
              <AnimatePresence>
                <div
                  className="flex flex-wrap -mx-1 min-h-[100px]"
                  key={`sources`}
                >
                  {resources &&
                    resources.map((item, idx) => {
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
                            className="rounded hover:bg-gray-100 bg-gray-100/50 p-2 group block relative"
                          >
                            <div className="flex flex-row items-center justify-start ">
                              <div className="w-auto">
                                <div className="flex flex-row items-center justify-start px-1.5 py-0.5 leading-none bg-blue-400 font-light lg:text-xs text-[10px] rounded-full text-white w-auto flex-1 capitalize font-bold">
                                  <Type data={item.type} />
                                </div>
                              </div>
                            </div>

                            <p className="text-xs my-2">{item.title}</p>
                            {/* <p className="text-xs">{item.url}</p> */}

                            <div className="flex flex-row items-center justify-start ">
                              <div className="w-auto flex-none">
                                <Image
                                  className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
                                  src="/logo-color.png"
                                  alt="Kruze Logo"
                                  width={14}
                                  height={16}
                                  priority
                                />
                              </div>
                              <div className="text-[10px] md:text-xs w-auto flex-1 capitalize font-medium">
                                Kruze Consulting
                              </div>
                              <div className="text-blue-600 flex-none text-xs text-right">
                                <span className="group-hover:underline">
                                  {/* Read more{' '} */}
                                  <ArrowTopRightOnSquareIcon className="w-3 h-3 inline opacity-50  group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 duration-200" />
                                </span>
                              </div>
                            </div>
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
                      className=" flex items-center text-dark-900 font-bold text-blue-400 -mx-1 mb-2"
                    >
                      <div className="w-auto px-1">
                        <div className="w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center">
                          <ChatBubbleBottomCenterTextIcon className="text-white w-4 h-4 inline" />
                        </div>
                      </div>
                      <div className="w-auto px-1 text-base lg:text-lg">
                        Answer
                      </div>
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
                          className="prose-xl prose-img:rounded-xl prose-headings:underline prose-a:text-blue-600"
                          dangerouslySetInnerHTML={{
                            __html: question.answer,
                          }}
                        />
                      ) : (
                        <div className="prose-xl prose-img:rounded-xl prose-headings:underline prose-a:text-blue-600">
                          <ReactMarkdown>{question.answer}</ReactMarkdown>
                        </div>
                      )}
                    </motion.div>

                    <motion.div>
                      <div className="pt-4 mt-4 border-t border-slate-300">
                        <div className="flex flex-row -mx-2 items-center justify-between">
                          <div className="w-auto px-2">
                            <CopyToClipboard text={strippedString} />
                          </div>
                          <div className="w-auto px-2 relative">
                            {!isToDelete && (
                              <button
                                type="button"
                                onClick={() => setIsToDelete(true)}
                                className="bg-red-100 p-1 group-hover:opacity-100 opacity-20 rounded"
                              >
                                <TrashIcon className="w-4 h-4 text-red-600" />
                              </button>
                            )}

                            {isToDelete && (
                              <div className="absolute right-0 -top-4 flex items-center justify-center backdrop-blur-sm bg-gray-100/40">
                                <button
                                  className="hover:opacity-100 opacity-60 flex flex-col items-center text-center text-xs p-1"
                                  type="button"
                                  onClick={onClick}
                                >
                                  <CheckIcon className="w-5 h-5 inline-block text-green-600" />
                                  <span className="opacity-60">Confirm</span>
                                </button>
                                <button
                                  className="hover:opacity-100 opacity-60 flex flex-col items-center text-center text-xs p-1"
                                  type="button"
                                  onClick={() => setIsToDelete(false)}
                                >
                                  <XMarkIcon className="w-5 h-5 inline-block text-red-600" />
                                  <span className="opacity-60">Cancel</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
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
