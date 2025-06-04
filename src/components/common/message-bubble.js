import React, { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'

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
        role === 'user' ? 'bg-white text-right' : 'bg-white border border-slate-200'
      } ${
        role === 'assistant' ? '' : ''
      } rounded-md w-full m-b-content`}
    >
      {role === 'user' ? (
        <UserMessageWrapper onRemove={onRemove}>
          <div ref={contentRef}>
            <ReactMarkdown>{message}</ReactMarkdown>
          </div>
        </UserMessageWrapper>
      ) : (
        <AssistantMessageWrapper role={role} onRemove={onRemove}>
          <div ref={contentRef}>
            <ReactMarkdown>{message}</ReactMarkdown>
          </div>
        </AssistantMessageWrapper>
      )}
    </div>
  )
}
