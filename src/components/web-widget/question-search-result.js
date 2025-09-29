import { Menu } from '@headlessui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { Fragment, useMemo, useState } from 'react'
import CopyToClipboard from '../copy-to-clipboard'
import InlineLoading from '../InlineLoading'
import TypingEffect from './typing-placeholder'

const links = [
  { val: 'inaccurate', label: 'Inaccurate' },
  { val: 'not-helpful', label: 'Is not helpful' },
]

import {
  ArrowPathIcon,
  ChatBubbleBottomCenterTextIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  FlagIcon,
  HandThumbDownIcon,
  HandThumbUpIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/solid'

import {
  faLinkedin,
  faSquareXTwitter,
} from '@fortawesome/free-brands-svg-icons'
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
  isStreaming = false,
}) {
  const [isOpen, setIsOpen] = useState(isLatest)
  const [showSources, setShowSources] = useState(false)

  // Memoize expensive string operations
  const strippedString = useMemo(
    () => question.answer.replace(/(<([^>]+)>)/gi, ''),
    [question.answer]
  )

  const resourceCount =
    typeof question.resourceCount === 'number'
      ? question.resourceCount
      : Array.isArray(question.sources)
      ? question.sources.length
      : null

  const resourceSummary = useMemo(() => {
    if (resourceCount === null) {
      return {
        label: 'Gathering resources',
        message: 'Gathering supporting resources…',
      }
    }

    if (resourceCount === 0) {
      return {
        label: 'No resources found',
        message: 'No supporting resources found',
      }
    }

    const plural = resourceCount === 1 ? 'resource' : 'resources'

    return {
      label: `${resourceCount} ${plural}`,
      message: `${resourceCount} supporting ${plural} found`,
    }
  }, [resourceCount])

  const currentStage = question.stage ?? (question.answer ? 'complete' : 'idle')

  const currentStageMessage = useMemo(() => {
    switch (currentStage) {
      case 'submitting':
        return 'Submitting your question…'
      case 'embedding':
        return 'Querying knowledge base…'
      case 'resources':
        return resourceSummary.message
      case 'prompting':
        return 'Creating prompt for the language model…'
      case 'generating':
        return 'Generating answer…'
      default:
        return ''
    }
  }, [currentStage, resourceSummary])

  const stageDefinitions = useMemo(
    () => [
      // { key: 'submitting', label: 'Submitting question' },
      { key: 'embedding', label: 'Querying knowledge base' },
      { key: 'resources', label: resourceSummary.label },
      // { key: 'prompting', label: 'Preparing prompt' },
      { key: 'generating', label: 'Generating answer' },
    ],
    [resourceSummary]
  )

  const stageKeys = useMemo(
    () => stageDefinitions.map((stage) => stage.key),
    [stageDefinitions]
  )

  const currentStageIndex =
    currentStage === 'complete'
      ? stageDefinitions.length
      : stageKeys.indexOf(currentStage)

  const showLoadingStages =
    isLatest && currentStage !== 'complete' && currentStage !== 'error'

  const isErrored = currentStage === 'error'
  const isInProgress = currentStage !== 'complete' && !isErrored

  const stageBadgeStyles = {
    done: 'bg-blue-100 border-blue-200 text-blue-700',
    current: 'bg-blue-500/10 border-blue-300 text-blue-600',
    pending: 'bg-slate-100 border-slate-200 text-slate-500',
  }

  // Memoize encoded URLs for social sharing
  const shareUrls = useMemo(
    () => ({
      x: `https://twitter.com/intent/tweet/?url=${encodeURIComponent(
        widgetpage
      )}&text=${encodeURIComponent(question.question)}%0A${encodeURIComponent(
        ' — '
      )}%0A${encodeURIComponent(
        strippedString
      )}&media=https://kruzeconsulting.com/img/hero_vanessa_2020.jpg&hashtags=kruzeconsulting,aiwidget,ai`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
        widgetpage
      )}&title=${encodeURIComponent(
        question.question
      )}&summary=${encodeURIComponent(
        strippedString
      )}&source=${encodeURIComponent(widgetpage)}`,
      email: `mailto:?subject=${encodeURIComponent(
        question.question
      )}&body=${encodeURIComponent(
        `Question:\n${question.question}\n\nAnswer:\n${strippedString}\n\nAI Chat With Kruze's Extensive Startup Accounting And Finance Knowledge Base ${widgetpage}.\n\nGenerated using Kruze Consulting's experimental AI Accounting Bot based on Kruze's published data and content. Do not rely on these responses, always consult your CPA, tax advisor, accountant or lawyer.\nCopyright © Kruze Consulting https://kruzeconsulting.com/.\nNot for commercial use.`
      )}`,
    }),
    [question.question, strippedString]
  )

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
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: isLatest ? 0 : 1,
                  }}
                  key="answer-header"
                  className=" flex items-center text-dark-900 font-bold text-blue-400 -mx-1 mb-2"
                >
                  <div className="w-auto px-1">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-200 ${
                        isErrored ? 'bg-red-500' : 'bg-blue-400'
                      }`}
                    >
                      {isErrored ? (
                        <ExclamationTriangleIcon className="text-white w-4 h-4 inline" />
                      ) : isInProgress ? (
                        <ArrowPathIcon className="text-white w-4 h-4 inline animate-spin" />
                      ) : (
                        <ChatBubbleBottomCenterTextIcon className="text-white w-4 h-4 inline" />
                      )}
                    </div>
                  </div>

                  <div className="w-auto px-1 text-base lg:text-lg min-h-[1.5rem] flex items-center">
                    {isErrored ? (
                      'Unable to generate answer'
                    ) : currentStage === 'complete' ? (
                      'Answer'
                    ) : (
                      <TypingEffect text={currentStageMessage} speed={70} />
                    )}
                  </div>
                </motion.div>
                {showLoadingStages && (
                  <motion.div
                    key="answer-stages"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="mb-2"
                  >
                    <div className="flex flex-wrap gap-2">
                      {stageDefinitions.map((stage, idx) => {
                        const status =
                          currentStageIndex === -1
                            ? 'pending'
                            : currentStageIndex > idx
                            ? 'done'
                            : currentStageIndex === idx
                            ? 'current'
                            : 'pending'

                        return (
                          <div
                            key={stage.key}
                            className={`flex items-center gap-1 px-1.5 py-1 text-xs font-medium border rounded-full ${stageBadgeStyles[status]}`}
                          >
                            {status === 'done' ? (
                              <CheckCircleIcon className="w-4 h-4 text-current" />
                            ) : status === 'current' ? (
                              <ArrowPathIcon className="w-4 h-4 text-current animate-spin" />
                            ) : (
                              <ClockIcon className="w-4 h-4 text-current" />
                            )}
                            <span>{stage.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{
                    duration: isLatest ? 0.1 : 0.3,
                    delay: isLatest ? 0 : 1,
                  }}
                  key="answer-content"
                  className="grow"
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
                      <ReactMarkdown key={`markdown-${question.answer.length}`}>
                        {question.answer}
                      </ReactMarkdown>
                    </div>
                  )}
                </motion.div>

                {
                  // show sources when question is received
                  isStreaming === false && question.sources.length > 0 && (
                    <>
                      <motion.div
                        key="copyright-notice"
                        className=" text-xs p-3 mt-3 bg-slate-100 rounded"
                      >
                        <div
                          dangerouslySetInnerHTML={{
                            __html: copyRightHtml,
                          }}
                        />
                      </motion.div>
                      <motion.div key="social-sharing">
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
                                    title="Share on X"
                                    target="_blank"
                                    rel="noopener"
                                    href={shareUrls.x}
                                    className="w-4 h-4 text-slate-400 hover:text-blue-600 inline-block rounded-full"
                                  >
                                    <FontAwesomeIcon icon={faSquareXTwitter} />
                                  </a>
                                </div>
                                <div className="w-auto px-2">
                                  <a
                                    title="Share on LinkedIn"
                                    target="_blank"
                                    rel="noopener"
                                    href={shareUrls.linkedin}
                                    className="w-4 h-4 text-slate-400 hover:text-blue-600 inline-block rounded-full"
                                  >
                                    <FontAwesomeIcon icon={faLinkedin} />
                                  </a>
                                </div>
                                <div className="w-auto px-2">
                                  <a
                                    title="Share by Email"
                                    target="_blank"
                                    rel="noopener"
                                    href={shareUrls.email}
                                    className="w-4 h-4 text-slate-400 hover:text-blue-600 inline-block rounded-full"
                                  >
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
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: 0.5,
                        }}
                        key="sources-header"
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
                        <button
                          onClick={() => setShowSources(!showSources)}
                          className="w-auto px-1 text-base lg:text-lg hover:text-blue-600 transition-colors duration-200 flex items-center"
                        >
                          Related resources
                          <ChevronDownIcon
                            className={`ml-2 w-4 h-4 duration-200 ${
                              showSources
                                ? 'transform rotate-0'
                                : 'transform -rotate-90'
                            }`}
                          />
                        </button>
                      </motion.div>
                      <motion.div
                        key="sources-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: showSources ? 'auto' : 0,
                          opacity: showSources ? 1 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-wrap -mx-0.5 min-h-[100px]">
                          {question.sources &&
                            question.sources.map((item, idx) => (
                              <SourceCard
                                key={`source-${idx}`}
                                item={item}
                                index={idx}
                              />
                            ))}
                        </div>
                      </motion.div>
                    </>
                  )
                }
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
