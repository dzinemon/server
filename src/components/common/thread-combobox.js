import { useState } from 'react'

export default function ThreadCombobox({
  threads,
  currentThreadId,
  setCurrentThreadId,
}) {
  const [query, setQuery] = useState('')

  const filteredThreads =
    query === ''
      ? threads
      : threads.filter((thread) => {
          return thread.name.toLowerCase().includes(query.toLowerCase())
        })

  return (
    <div className="space-y-3 w-full">
      <div>
        <div className="flex flex-row items-stretch gap-2 justify-between">
          {threads.length > 0 && (
            <div className="grow">
              <p className="font-bold">Threads</p>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="🔎 Search threads by name"
                className="px-2 w-full py-1.5 border rounded-md flex-1 font-normal focus:outline-none focus:border-gray-400"
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col divide-y border border rounded-lg">
        {filteredThreads.map((thread, idx, arr) => (
          <button
            key={thread.id}
            onClick={() => setCurrentThreadId(thread.id)}
            className={`${
              thread.id === currentThreadId
                ? 'bg-kruze-blue/20 text-kruze-blue'
                : 'bg-white text-kruze-secondary'
            }
            ${
              idx === 0
                ? 'rounded-t-md'
                : idx === arr.length - 1
                ? 'rounded-b-md'
                : ''
            }
            ${arr.length === 1 ? 'rounded-b-md' : ''}
            ${idx !== 0 && idx !== arr.length - 1 ? 'rounded-none' : ''}
            
        
            p-2 hover:bg-kruze-blue hover:text-white hover:opacity-80 text-left leading-none`}
          >
            {thread.name}
          </button>
        ))}
      </div>
    </div>
  )
}
