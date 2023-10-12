import React, { useState } from 'react'
import { DocumentDuplicateIcon, ClipboardIcon } from '@heroicons/react/24/solid'

const CopyToClipboard = ({ text }) => {
  const [copied, setCopied] = useState(false)

  const handleClick = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000) // Reset copied state after 2 seconds
    })
  }

  return (
    <div>
      <textarea
        rows="10"
        cols="50"
        value={text}
        readOnly
        visibility="hidden"
        className="hidden"
      />
      <button
        disabled={copied}
        title="Copy answer"
        onClick={handleClick}
        className={`${
          copied && 'opacity-50'
        } w-4 h-4 text-slate-400 hover:text-blue-600 inline-block rounded-full`}
      >
        {copied ? <DocumentDuplicateIcon /> : <ClipboardIcon />}
      </button>
    </div>
  )
}

export default CopyToClipboard
