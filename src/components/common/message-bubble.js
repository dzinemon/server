import React, { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import {
  ChevronDownIcon,
  ChevronUpIcon,
  ClipboardIcon,
  ClipboardDocumentCheckIcon,
  TrashIcon,
} from '@heroicons/react/20/solid'

export const copyToClipboardRichText = async (element) => {
  if (element) {
    const innerHtml = element.innerHTML
    try {
      // Create a new ClipboardItem
      const blob = new Blob([innerHtml], { type: 'text/html' })
      const clipboardItem = new ClipboardItem({ 'text/html': blob })

      // Use the Clipboard API to write the clipboard item
      await navigator.clipboard.write([clipboardItem])
    } catch (err) {
      console.error('Failed to copy!', err)
    } finally {
      console.log('finally')
    }
  }
}

// create component for message bubble that will be expandable and collapsible with a button and max height, should have 2 variants: for user and system/assistant; system  messages are expanded by default but with a button to collapse, and user messages are collapsed by default with a button to expand

export const UserMessageWrapper = ({ children, role, onRemove }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  return (
    <div className={``}>
      <div>
        {isExpanded ? (
          <div>{children}</div>
        ) : (
          <div className="overflow-hidden" style={{ maxHeight: '200px' }}>
            <div>{children}</div>
          </div>
        )}
      </div>
      <div className="flex justify-end gap-3 border-t border-slate-300 mt-2 pt-2">
        {/* <button
          title="copy to clipboard"
          onClick={async () => {
            setIsCopied(true)
            await copyToClipboardRichText(contentRef.current)
            setTimeout(() => setIsCopied(false), 1000)
          }}
          type="button"
          className="p-1 flex justify-between bg-blue-500 text-white rounded text-xs hover:bg-blue-600 active:bg-blue-700 group"
        >
          {isCopied ? (
            <ClipboardDocumentCheckIcon className="w-3.5 h-3.5" />
          ) : (
            <ClipboardIcon className="w-3.5 h-3.5" />
          )}
        </button> */}

        <button
          // remove message
          onClick={onRemove}
          type="button"
          className="p-1 flex justify-between bg-red-500 text-white rounded text-xs hover:bg-red-600 active:bg-red-700 group"
        >
          <TrashIcon className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          type="button"
          className="p-1 flex justify-between bg-blue-500 text-white rounded text-xs hover:bg-blue-600 active:bg-blue-700 group"
        >
          {isExpanded ? (
            <ChevronUpIcon className="w-3.5 h-3.5" />
          ) : (
            <ChevronDownIcon className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  )
}

export const AssistantMessageWrapper = ({ children, role, onRemove }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showButton, setShowButton] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const contentRef = useRef(null)

  useEffect(() => {
    if (contentRef.current) {
      const height = contentRef.current.scrollHeight
      if (height > 360) {
        setShowButton(true)
      }
    }
  }, [children])

  return (
    <>
      <div ref={contentRef}>
        {isExpanded ? (
          <div>{children}</div>
        ) : (
          <div className="overflow-hidden" style={{ maxHeight: '360px' }}>
            <div>{children}</div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3 border-t border-slate-300 mt-2 pt-2">
        {/* Toolbar */}
        <button
          title="copy to clipboard"
          onClick={async () => {
            setIsCopied(true)
            await copyToClipboardRichText(contentRef.current)
            setTimeout(() => setIsCopied(false), 1000)
          }}
          type="button"
          className="p-1 flex justify-between bg-blue-500 text-white rounded text-xs hover:bg-blue-600 active:bg-blue-700 group"
        >
          {isCopied ? (
            <ClipboardDocumentCheckIcon className="w-3.5 h-3.5" />
          ) : (
            <ClipboardIcon className="w-3.5 h-3.5" />
          )}
        </button>

        <button
          // remove message
          onClick={onRemove}
          type="button"
          className="p-1 flex justify-between bg-red-500 text-white rounded text-xs hover:bg-red-600 active:bg-red-700 group"
        >
          <TrashIcon className="w-3.5 h-3.5" />
        </button>

        {showButton && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            type="button"
            className="p-1 flex justify-between bg-blue-500 text-white rounded text-xs hover:bg-blue-600 active:bg-blue-700 group"
          >
            {isExpanded ? (
              <ChevronUpIcon className="w-3.5 h-3.5" />
            ) : (
              <ChevronDownIcon className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>
    </>
  )
}

export default function MessageBubble({ message, role, onRemove }) {
  const contentRef = useRef(null)

  return (
    <div
      className={`p-3 ${
        role === 'user'
          ? 'bg-white text-right'
          : 'bg-white border border-slate-200'
      } ${role === 'assistant' ? '' : ''} rounded-md w-full m-b-content`}
    >
      {role === 'user' ? (
        <UserMessageWrapper onRemove={onRemove}>
          <div ref={contentRef}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Style tables properly
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-gray-50">{children}</thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="bg-white divide-y divide-gray-200">
                    {children}
                  </tbody>
                ),
                tr: ({ children }) => (
                  <tr className="hover:bg-gray-50">{children}</tr>
                ),
                th: ({ children }) => (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200 last:border-r-0">
                    {children}
                  </td>
                ),
                // Style other markdown elements
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold mt-6 mb-4 text-gray-900">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-bold mt-5 mb-3 text-gray-900">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-900">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="mb-3 leading-relaxed text-gray-700">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-3 space-y-1">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-3 space-y-1">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-gray-700">{children}</li>
                ),
                code: ({ inline, children }) =>
                  inline ? (
                    <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800">
                      {children}
                    </code>
                  ) : (
                    <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto mb-3">
                      <code className="text-sm font-mono text-gray-800">
                        {children}
                      </code>
                    </pre>
                  ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-3 bg-blue-50 italic text-gray-700">
                    {children}
                  </blockquote>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {message}
            </ReactMarkdown>
          </div>
        </UserMessageWrapper>
      ) : (
        <AssistantMessageWrapper role={role} onRemove={onRemove}>
          <div ref={contentRef}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Style tables properly
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-gray-50">{children}</thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="bg-white divide-y divide-gray-200">
                    {children}
                  </tbody>
                ),
                tr: ({ children }) => (
                  <tr className="hover:bg-gray-50">{children}</tr>
                ),
                th: ({ children }) => (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200 last:border-r-0">
                    {children}
                  </td>
                ),
                // Style other markdown elements
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold mt-6 mb-4 text-gray-900">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-bold mt-5 mb-3 text-gray-900">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-900">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="mb-3 leading-relaxed text-gray-700">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-3 space-y-1">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-3 space-y-1">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-gray-700">{children}</li>
                ),
                code: ({ inline, children }) =>
                  inline ? (
                    <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800">
                      {children}
                    </code>
                  ) : (
                    <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto mb-3">
                      <code className="text-sm font-mono text-gray-800">
                        {children}
                      </code>
                    </pre>
                  ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-3 bg-blue-50 italic text-gray-700">
                    {children}
                  </blockquote>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {message}
            </ReactMarkdown>
          </div>
        </AssistantMessageWrapper>
      )}
    </div>
  )
}
