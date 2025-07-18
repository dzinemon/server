import { Menu } from '@headlessui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { Fragment, useRef, useState } from 'react'
import CopyToClipboard from '../copy-to-clipboard'
import InlineLoading from '../InlineLoading'

const links = [
  { val: 'innacurate', label: 'Inaccurate' },
  { val: 'not-helpful', label: 'Is not helpful' },
]

import {
  ChatBubbleBottomCenterTextIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  FlagIcon,
  HandThumbDownIcon,
  HandThumbUpIcon,
} from '@heroicons/react/24/solid'

import { faLinkedinIn, faTwitter } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import SourceCard from '../common/source-card'

import ReactMarkdown from 'react-markdown'

export const widgetpage = 'https://kruzeconsulting.com/#ask-kruze-ai-tool'

export const copyRightHtml = `<p>Generated using Kruze Consulting's experimental AI Accounting Bot based on Kruze's published data and content. Do not rely on these responses, always consult your CPA, tax advisor, accountant or lawyer. </p>
<p>Copyright © <a className='text-sky-600 hover:border-dashed hover:border-b border-sky-600' href='https://kruzeconsulting.com/' target='_blank' rel='noopener'>Kruze Consulting</a>. Not for commercial use.</p>                      `

const encodedcopyRightHtml = encodeURIComponent(copyRightHtml)

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
            <div className="px-4 relative h-full w-full space-y-4">
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
                  className="flex flex-wrap -mx-0.5 min-h-[100px]"
                  key={`sources`}
                >
                  {question.sources &&
                    question.sources.map((item, idx) => (
                      <SourceCard
                        key={`source-${idx}`}
                        item={item}
                        index={idx}
                      />
                    ))}
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

                    <motion.div className=" text-xs p-3 mt-3 bg-slate-100 rounded">
                      <div
                        dangerouslySetInnerHTML={{ __html: copyRightHtml }}
                      />
                    </motion.div>

                    <motion.div ref={scrollTargetRef}>
                      <div className="pt-4 mt-4 border-t border-slate-300">
                        <div className="flex flex-row justify-between -mx-4">
                          <div className="w-auto px-4">
                            <div className="flex flex-row -mx-2 items-center">
                              <div className="w-auto px-2 text-sm opacity-80">
                                <span className="hidden md:inline">
                                  Do you like the answer?
                                </span>{' '}
                                Share on:
                              </div>
                              <div className="w-auto px-2">
                                <a
                                  title="Share on Twitter"
                                  target="_blank"
                                  rel="noopener"
                                  href={`https://twitter.com/intent/tweet/?url=${widgetpage}&text=${
                                    question.question
                                  }%0A${' — '}%0A${strippedString}&media=https://kruzeconsulting.com/img/hero_vanessa_2020.jpg&hashtags=kruzeconsulting,aiwidget,ai`}
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
                                  href={`mailto:?subject=${question.question}&body=Question:%0A${question.question}%0A%0AAnswer:%0A${strippedString} %0A%0A AI Chat With Kruze's Extensive Startup Accounting And Finance Knowledge Base ${widgetpage}.%0A%0A Generated using Kruze Consulting's experimental AI Accounting Bot based on Kruze's published data and content. Do not rely on these responses, always consult your CPA, tax advisor, accountant or lawyer.%0A Copyright © Kruze Consulting https://kruzeconsulting.com/. %0ANot for commercial use.`}
                                  className="w-4 h-4 text-slate-400 hover:text-blue-600 inline-block rounded-full"
                                >
                                  {/* <FontAwesomeIcon icon={faEnvelope} /> */}
                                  <EnvelopeIcon />
                                </a>
                              </div>
                              <div className="w-auto px-2">
                                <CopyToClipboard text={strippedString} />
                              </div>
                            </div>
                          </div>
                          <div className="w-auto px-4 hidden">
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
