import React, { useState, useMemo, Suspense } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid'

// Lazy load the source card component
const SourceCardCompact = React.lazy(() => import('./source-card-compact'))

export default function MessageSources({ sources }) {
  const [open, setOpen] = useState(false)

  const uniqueSources = useMemo(
    () =>
      sources.filter(
        (item, idx, arr) => arr.findIndex((t) => t.url === item.url) === idx
      ),
    [sources]
  )

  if (!sources || sources.length === 0) {
    return null
  }

  return (
    <div className="w-full mt-3">
      <button
        type="button"
        className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 rounded hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
        onClick={() => setOpen(!open)}
        title={`${open ? 'Hide' : 'Show'} ${uniqueSources.length} resource${
          uniqueSources.length !== 1 ? 's' : ''
        }`}
      >
        {open ? (
          <ChevronUpIcon className="w-3.5 h-3.5" />
        ) : (
          <ChevronDownIcon className="w-3.5 h-3.5" />
        )}
        {open ? 'Hide' : 'Show'} Resources ({uniqueSources.length})
      </button>

      {open && (
        <div className="flex flex-wrap gap-2 mt-3">
          {uniqueSources.map((item, idx) => (
            <Suspense
              key={`source-${idx}`}
              fallback={
                <div className="w-16 h-8 bg-gray-100 rounded animate-pulse" />
              }
            >
              <SourceCardCompact item={item} index={idx} />
            </Suspense>
          ))}
        </div>
      )}
    </div>
  )
}
