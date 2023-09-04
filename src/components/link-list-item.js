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
    <div className="flex group flex-row justify-between items-center border-b border-gray-300">
      {/* <div>{JSON.stringify(link)}</div> */}
      <div className="px-4 py-2">
        <div className="">
          {link.name && (
            <p>
              <span className="font-bold rounded-full leading-none">
                {link.id}
              </span>{' '}
              {link.name}
            </p>
          )}
          {link.url && <p className="text-sm opacity-60">{link.url}</p>}
        </div>
        <div className="text-xs opacity-60">
          Chunk size: {Array.from(link.uuids).length}
        </div>
      </div>
      <div className="flex justify-end flex-none px-4 rounded-lg w-44 ">
        {isToDelete && (
          <>
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
          </>
        )}

        {!isToDelete && (
          <button
            type="button"
            onClick={() => setIsToDelete(true)}
            className="bg-red-100 p-2 group-hover:opacity-100 opacity-0"
          >
            <TrashIcon className="w-5 h-5 text-red-600" />
          </button>
        )}
      </div>
    </div>
  )
}
