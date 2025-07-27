import React, { useEffect, useRef, useState, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import {
  ChevronDownIcon,
  ChevronUpIcon,
  ClipboardIcon,
  ClipboardDocumentCheckIcon,
  TrashIcon,
} from '@heroicons/react/20/solid'

export const copyToClipboardText = async (element) => {
  if (element) {
    try {
      const text = element.textContent || element.innerText || ''
      await navigator.clipboard.writeText(text)
      return true
    } catch (err) {
      console.error('Failed to copy text!', err)
      return false
    }
  }
  return false
}

export const copyToClipboardRichText = async (element) => {
  if (element) {
    const innerHtml = element.innerHTML
    try {
      // Create a new ClipboardItem
      const blob = new Blob([innerHtml], { type: 'text/html' })
      const clipboardItem = new ClipboardItem({ 'text/html': blob })

      // Use the Clipboard API to write the clipboard item
      await navigator.clipboard.write([clipboardItem])
      return true
    } catch (err) {
      console.error('Failed to copy!', err)
      // Fallback to text-only copy
      try {
        await navigator.clipboard.writeText(
          element.textContent || element.innerText
        )
        return true
      } catch (textErr) {
        console.error('Text fallback also failed:', textErr)
        return false
      }
    }
  }
  return false
}

// Shared markdown components to avoid duplication
const markdownComponents = {
  // Style tables properly
  table: ({ children }) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
  tbody: ({ children }) => (
    <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>
  ),
  tr: ({ children }) => <tr className="hover:bg-gray-50">{children}</tr>,
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
    <h1 className="text-2xl font-bold mt-6 mb-4 text-gray-900">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-bold mt-5 mb-3 text-gray-900">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-900">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p
      className={`
      mb-3 leading-relaxed text-gray-700
      first:mt-0 last:mb-0
      `}
    >
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>
  ),
  li: ({ children }) => <li className="text-gray-700">{children}</li>,
  code: ({ inline, children }) =>
    inline ? (
      <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800">
        {children}
      </code>
    ) : (
      <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto mb-3">
        <code className="text-sm font-mono text-gray-800">{children}</code>
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
}

// create component for message bubble that will be expandable and collapsible with a button and max height, should have 2 variants: for user and system/assistant; system  messages are expanded by default but with a button to collapse, and user messages are collapsed by default with a button to expand

export const UserMessageWrapper = ({ children, onRemove, onEdit }) => {
  const [isCopied, setIsCopied] = useState(false)
  const contentRef = useRef(null)

  const handleCopy = async () => {
    if (contentRef.current) {
      setIsCopied(true)
      const success = await copyToClipboardText(contentRef.current)
      if (!success) {
        // Could show a toast notification here
        console.warn('Copy to clipboard failed')
      }
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  return (
    <div>
      <div
        ref={contentRef}
        className="px-4 py-3 bg-blue-50/70 border border-blue-100 rounded-lg"
      >
        {children}
      </div>
      <div className="flex justify-end gap-2 mt-2">
        <button
          title="Copy to clipboard"
          onClick={handleCopy}
          type="button"
          className="inline-flex items-center p-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isCopied ? (
            <ClipboardDocumentCheckIcon className="w-3.5 h-3.5" />
          ) : (
            <ClipboardIcon className="w-3.5 h-3.5" />
          )}
        </button>

        <button
          title="Remove message"
          onClick={onRemove}
          type="button"
          className="inline-flex items-center p-1.5 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          <TrashIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

const MAX_MESSAGE_HEIGHT = 360

export const AssistantMessageWrapper = ({ children, onRemove }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showButton, setShowButton] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const contentRef = useRef(null)

  const updateButtonVisibility = () => {
    if (contentRef.current) {
      const height = contentRef.current.scrollHeight
      // Ensure the button remains visible once it is determined to be needed
      if (height > MAX_MESSAGE_HEIGHT) {
        setShowButton(true)
      }
    }
  }

  useEffect(() => {
    updateButtonVisibility()
  }, [children])

  useEffect(() => {
    const observer = new MutationObserver(updateButtonVisibility)
    if (contentRef.current) {
      observer.observe(contentRef.current, { childList: true, subtree: true })
    }
    return () => observer.disconnect()
  }, [contentRef])

  const handleCopy = async () => {
    if (contentRef.current) {
      setIsCopied(true)
      const success = await copyToClipboardRichText(contentRef.current)
      if (!success) {
        // Could show a toast notification here
        console.warn('Copy to clipboard failed')
      }
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  const renderExpandCollapseButton = () => (
    <button
      title={isExpanded ? 'Collapse message' : 'Expand message'}
      onClick={() => setIsExpanded(!isExpanded)}
      type="button"
      className="inline-flex items-center px-2 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
    >
      {isExpanded ? (
        <>
          <ChevronUpIcon className="w-3.5 h-3.5 mr-1" />
          Show less
        </>
      ) : (
        <>
          <ChevronDownIcon className="w-3.5 h-3.5 mr-1" />
          Show more
        </>
      )}
    </button>
  )

  return (
    <>
      <div
        ref={contentRef}
        className="px-4 py-3 bg-white border border-gray-200 rounded-lg"
      >
        {isExpanded ? (
          <div>{children}</div>
        ) : (
          <div
            className="overflow-hidden relative"
            style={{ maxHeight: `${MAX_MESSAGE_HEIGHT}px` }}
          >
            <div>{children}</div>
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        <button
          title="Copy to clipboard"
          onClick={handleCopy}
          type="button"
          className="inline-flex items-center px-2 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isCopied ? (
            <>
              <ClipboardDocumentCheckIcon className="w-3.5 h-3.5 mr-1" />
              Copied!
            </>
          ) : (
            <>
              <ClipboardIcon className="w-3.5 h-3.5 mr-1" />
              Copy
            </>
          )}
        </button>

        <button
          title="Remove message"
          onClick={onRemove}
          type="button"
          className="inline-flex items-center px-2 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          <TrashIcon className="w-3.5 h-3.5 mr-1" />
          Delete
        </button>

        {showButton && renderExpandCollapseButton()}
      </div>
    </>
  )
}

export default function MessageBubble({ message, role, onRemove, onEdit }) {
  // Memoize the markdown rendering to avoid re-processing on every render
  const renderedContent = useMemo(
    () => (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {message}
      </ReactMarkdown>
    ),
    [message]
  )

  return (
    <div className={`${role === 'user' ? 'text-right' : 'bg-white'}`}>
      {role === 'user' ? (
        <UserMessageWrapper onRemove={onRemove} onEdit={onEdit}>
          {renderedContent}
        </UserMessageWrapper>
      ) : (
        <AssistantMessageWrapper onRemove={onRemove}>
          {renderedContent}
        </AssistantMessageWrapper>
      )}
    </div>
  )
}
