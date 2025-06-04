import { Dialog, Menu, Transition } from '@headlessui/react'
import {
  EnvelopeIcon,
  TrashIcon
} from '@heroicons/react/24/solid'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Fragment } from 'react'

import {
  faLinkedinIn,
  faTwitter
} from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ReactMarkdown from 'react-markdown'
import SourceCard from './source-card'
import CopyToClipboard from '../copy-to-clipboard'

import { copyRightHtml, widgetpage } from '../web-widget/question-search-result'

export default function QuestionDialogModal({
  data,
  open,
  setOpen,
  handleRemove,
}) {
  let strippedString =
    data && data.answer ? data.answer.replace(/(<([^>]+)>)/gi, '') : ''

  return (
    <>
      <Transition appear show={open} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25 backdrop-blur-md" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="space-y-4 mb-4">
                    <p className="text-lg font-medium leading-6 text-slate-600">
                      Preview Question Details
                    </p>
                    <p className="text-2xl font-bold text-slate-800">
                      {data.question}
                    </p>
                    {data && data.id && (
                      <p className="text-sm text-slate-500">
                        <strong>{JSON.parse(data.resources).length}</strong>{' '}
                        Resources Found
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap my-4 -mx-0.5">
                    {data.resources &&
                      JSON.parse(data.resources).map((item, idx) => (
                        <SourceCard key={`source-${idx}`} item={item} index={idx} />
                      ))}
                  </div>

                  <div className="mb-2">
                    <p className="text-sm text-slate-500">Generated Answer</p>
                  </div>

                  {data.answer && (
                    <div>
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
                        {data.answer.indexOf('</') >= 0 ? (
                          <div
                            className="prose prose-img:rounded-xl prose-headings:underline prose-a:text-blue-600"
                            dangerouslySetInnerHTML={{
                              __html: data.answer,
                            }}
                          />
                        ) : (
                          <div className="prose prose-img:rounded-xl prose-headings:underline prose-a:text-blue-600">
                            <ReactMarkdown>{data.answer}</ReactMarkdown>
                          </div>
                        )}
                      </motion.div>
                    </div>
                  )}

                  <motion.div className=" text-xs p-3 mt-3 bg-slate-100 rounded">
                    <div dangerouslySetInnerHTML={{ __html: copyRightHtml }} />
                  </motion.div>

                  <motion.div>
                    <div className="py-3 mt-4 border-y border-slate-300">
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
                                  data.question
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
                                href={`https://www.linkedin.com/shareArticle?mini=true&url=${widgetpage}&title=${data.question}&summary=${strippedString}&source=${widgetpage}`}
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
                                href={`mailto:?subject=${data.question}&body=Question:%0A${data.question}%0A%0AAnswer:%0A${strippedString} %0A%0A AI Chat With Kruze's Extensive Startup Accounting And Finance Knowledge Base ${widgetpage}.%0A%0A Generated using Kruze Consulting's experimental AI Accounting Bot based on Kruze's published data and content. Do not rely on these responses, always consult your CPA, tax advisor, accountant or lawyer.%0A Copyright © Kruze Consulting https://kruzeconsulting.com/. %0ANot for commercial use.`}
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
                        <div className="w-auto px-4 ">
                          <div className="flex flex-row -mx-2 items-center text-slate-400">
                            <div className="w-auto px-2">
                              <Menu as={'div'} className={'relative'}>
                                <Menu.Button className="inline-flex justify-center rounded-sm p-1 bg-slate-200 text-sm font-medium text-gray-900 hover:bg-rose-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2">
                                  <TrashIcon className="w-4 h-4 text-white" />
                                </Menu.Button>
                                <Menu.Items className="absolute bottom-10 bg-rose-50 right-0 mt-2 w-64 p-2 origin-bottom-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                                  <Menu.Item>
                                    <div className="">
                                      <p className="font-bold text-rose-400">
                                        Delete Item
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        Item{' '}
                                        <strong className="underline">
                                          {data.question}
                                        </strong>{' '}
                                        be deleted permanently. Are you sure you
                                        want to delete this item?
                                      </p>
                                    </div>
                                  </Menu.Item>
                                  <Menu.Item>
                                    <button
                                      type="button"
                                      className="inline-flex items-center justify-center rounded-md border border-rose-400 bg-rose-100 px-4 py-2 text-sm font-medium text-rose-500 hover:text-white hover:bg-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                      onClick={() => {
                                        handleRemove(data.id, data.uuids)
                                        setOpen(false)
                                      }}
                                    >
                                      <TrashIcon
                                        className="
                            h-4 w-4 text-rose-500
                          "
                                      />{' '}
                                      Remove Item
                                    </button>
                                  </Menu.Item>
                                </Menu.Items>
                              </Menu>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <div className="space-y-2 bg-slate-50 mt-4 rounded-b-lg p-2">
                    <div className="items-center flex justify-between space-x-4">
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md border border-blue-400 bg-gray-100 px-4 py-2 text-sm font-medium text-blue-400 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                        onClick={() => setOpen(false)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
