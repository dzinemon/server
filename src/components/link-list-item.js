import React, { useState } from 'react'

import {
  LinkIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid'

export default function LinkListItem({ link, onClick }) {
  const [isToDelete, setIsToDelete] = useState(false)

  return (
    <div className="flex group flex-row justify-between items-center border-b border-gray-300 relative hover:bg-gray-100">
      {/* <div>{JSON.stringify(link)}</div> */}
      <div className="px-2 lg:px-4 py-2">
        <div className="">
          {link.name && (
            <p>
              <span className="font-bold rounded-full leading-none">
                {link.id}
              </span>{' '}
              <span className="text-sm lg:text-lg">{link.name}</span>
            </p>
          )}
          {link.url && (
            <p className="text-sm opacity-60">
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="text-sky-500 hover:text-sky-600"
              >
                {link.url}
              </a>
            </p>
          )}
        </div>
        <div className="text-xs opacity-60">
          Chunk size: {Array.from(link.uuids).length}
        </div>
      </div>
      <div className="flex justify-end px-2 lg:px-4 flex-none rounded-lg shrink w-24">
        {!isToDelete && (
          <button
            type="button"
            onClick={() => setIsToDelete(true)}
            className="bg-red-100 p-1 group-hover:opacity-100 opacity-20 rounded"
          >
            <TrashIcon className="w-4 h-4 text-red-600" />
          </button>
        )}
      </div>

      {isToDelete && (
        <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-gray-100/40">
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
  )
}
