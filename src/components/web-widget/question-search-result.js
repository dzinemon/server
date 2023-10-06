import { useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import InlineLoading from '../InlineLoading'
import { Fragment } from 'react'
import { Menu } from '@headlessui/react'

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
  FlagIcon,
  HandThumbDownIcon,
  HandThumbUpIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/solid'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope } from '@fortawesome/free-regular-svg-icons'
import {
  faTwitter,
  faLinkedin,
  faLinkedinIn,
} from '@fortawesome/free-brands-svg-icons'

import ReactMarkdown from 'react-markdown'

const widgetpage = 'https://lush-rock.cloudvent.net/ai-widget/'

const Type = ({ data }) => {
  switch (data) {
    case 'webpage':
      return (
        <>
          <DocumentChartBarIcon className="w-3 h-3 mr-1" />
          Web page
        </>
      )
      break
    case 'post':
      return (
        <>
          <DocumentChartBarIcon className="w-3 h-3 mr-1" />
          Blog post
        </>
      )
      break
    case 'qna':
      return (
        <>
          <DocumentChartBarIcon className="w-3 h-3 mr-1" />Q & A
        </>
      )
      break
    case 'tax_calendar':
      return (
        <>
          <CalendarIcon className="w-3 h-3 mr-1" />
          Tax Calendars
        </>
      )
      break
    case 'tip':
      return (
        <>
          <DocumentChartBarIcon className="w-3 h-3 mr-1" />
          Startup Tips
        </>
      )
      break
    default:
      console.log('Unknown page')
  }
}

export default function QuestionSearchResult({
  question,
  isLatest,
  handleLike,
  handleDislike,
  handleReport,
}) {
  const scrollTargetRef = useRef(null)
  const [isOpen, setIsOpen] = useState(isLatest)

  let strippedString = question.answer.replace(/(<([^>]+)>)/gi, '')

  function MyMenu() {
    return (
      <div className="relative">
        <Menu>
          <Menu.Items className="-top-14 -left-20 absolute w-40 text-sm shadow rounded">
            {links.map((link, idx) => (
              /* Use the `active` state to conditionally style the active item. */
              <Menu.Item
                key={link.val + '-' + idx}
                as={Fragment}
                className="flex flex-col justify-center rounded rounded w-full"
              >
                {({ active }) => (
                  <button
                    onClick={() => handleReport(question, link.label)}
                    className={`${
                      active ? 'bg-blue-500 text-white' : 'bg-white text-black'
                    } block text-center w-full px-4`}
                  >
                    {link.label}
                  </button>
                )}
              </Menu.Item>
            ))}
          </Menu.Items>
          <Menu.Button>
            <div className="w-4 h-4">
              <FlagIcon />
            </div>
          </Menu.Button>
        </Menu>
      </div>
    )
  }

  return (
    <div className="w-full bg-white rounded-lg bg-gradient-to-b from-white to-gray-100/50">
      <div className="flex flex-row justify-between items-center">
        <div className="py-2 px-3 md:p-4 text-base leading-none md:text-lg lg:text-xl font-bold text-left text-gray-900">
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
                className=" flex items-center text-dark-900 font-bold text-blue-400 -mx-1 mb-2"
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
                <div className="w-auto px-1 text-base lg:text-lg">
                  Resources / Search results
                </div>
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

                    <motion.div>
                      <div className="pt-4 mt-4 border-t border-slate-300">
                        <div className="flex flex-row justify-between -mx-4">
                          <div className="w-auto px-4">
                            <div className="flex flex-row -mx-2 items-center">
                              <div className="w-auto px-2 text-sm opacity-80">
                                Do you like the answer? Share on:
                              </div>
                              <div className="w-auto px-2">
                                <a
                                  title="Share on Twitter"
                                  target="_blank"
                                  rel="noopener"
                                  href={`https://twitter.com/intent/tweet/?url=${widgetpage}&text=${
                                    question.question
                                  }${' — '}${strippedString}&media=https://kruzeconsulting.com/img/hero_vanessa_2020.jpg&hashtags=kruzeconsulting,aiwidget,ai`}
                                  className="w-4 h-4 text-slate-400 hover:text-blue-600 inline-block rounded-full"
                                >
                                  <FontAwesomeIcon icon={faTwitter} />
                                </a>
                              </div>
                              <div className="w-auto px-2">
                                <a
                                  title="Share on LinkedIn"
                                  target="_blank"
                                  rel="noopener"
                                  // https://www.linkedin.com/shareArticle?url=<URL_OF_WEBPAGE>&title=<TITLE>&summary=<SUMMARY>&source=<SOURCE>
                                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${widgetpage}&title=${question.question}&summary=${strippedString}&source=${widgetpage}`}
                                  className="w-4 h-4 text-slate-400 hover:text-blue-600 inline-block rounded-full"
                                >
                                  <FontAwesomeIcon icon={faLinkedinIn} />
                                </a>
                              </div>
                              <div className="w-auto px-2">
                                <a
                                  title="Share by Email"
                                  target="_blank"
                                  rel="noopener"
                                  href={`mailto:?subject=${question.question}&body=Question: ${question.question} · Answer: ${strippedString} ——— AI Chat With Kruze's Extensive Startup Accounting And Finance Knowledge Base ${widgetpage}.`}
                                  className="w-4 h-4 text-slate-400 hover:text-blue-600 inline-block rounded-full"
                                >
                                  {/* <FontAwesomeIcon icon={faEnvelope} /> */}
                                  <EnvelopeIcon />
                                </a>
                              </div>
                            </div>
                          </div>
                          <div className="w-auto px-4">
                            <div className="flex flex-row -mx-2 items-center text-slate-400">
                              <div className="w-auto px-2">
                                <div
                                  type="button"
                                  title={`${
                                    question.report
                                      ? question.report
                                      : 'Report this answer'
                                  }`}
                                  className={`${
                                    question.report ? 'text-red-400' : ''
                                  } w-4 h-4 hover:text-blue-600 inline-block rounded-full`}
                                >
                                  <MyMenu />
                                </div>
                              </div>
                              <div className="w-auto px-2">
                                <button
                                  onClick={handleDislike}
                                  title="Dislike this answer"
                                  className={`${
                                    question.dislike && 'text-blue-500'
                                  } w-4 h-4 hover:text-blue-600 inline-block rounded-full`}
                                >
                                  <HandThumbDownIcon />
                                </button>
                              </div>
                              <div className="w-auto px-2">
                                <button
                                  onClick={handleLike}
                                  title="Like this answer"
                                  className={`${
                                    question.like && 'text-blue-500'
                                  } w-4 h-4  hover:text-blue-600 inline-block rounded-full`}
                                >
                                  <HandThumbUpIcon />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
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
