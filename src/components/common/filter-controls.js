import { Listbox } from '@headlessui/react'
import { FunnelIcon } from '@heroicons/react/24/solid'

export default function FilterControls({ 
  filterBySourceArray, 
  setFilterBySourceArray,
  filterByTypeArray,
  setFilterByTypeArray,
  sourceFilters,
  typeFilters,
  userRole 
}) {
  if (userRole !== 'admin') {
    return null
  }

  return (
    <div className="w-auto relative">
      <div className="flex flex-col space-y-1 h-full items-between">
        <Listbox
          value={filterBySourceArray}
          onChange={setFilterBySourceArray}
          multiple
        >
          {({ open }) => (
            <>
              <Listbox.Button
                className={`${
                  filterBySourceArray.length > 0
                    ? 'bg-gray-400 text-white'
                    : 'bg-gray-200 text-gray-600'
                } w-full px-2 py-1.5 border rounded-md flex-1 font-normal focus:outline-none focus:border-gray-400 relative`}
              >
                <FunnelIcon className="w-6 h-6 inline" />
                {!open && (
                  <div className="absolute w-4 h-4 -top-2 -right-2 leading-none flex items-center justify-center rounded-full text-[10px] text-white bg-blue-600">
                    {filterBySourceArray.length}
                  </div>
                )}
              </Listbox.Button>
              <Listbox.Options
                className={
                  'absolute w-24 text-xs bottom-0 bg-white border border-gray-200 rounded-md shadow-lg z-20'
                }
              >
                {sourceFilters.map((filter, idx) => (
                  <Listbox.Option
                    key={`${filter}-${idx}`}
                    value={filter}
                    className={'px-4 py-2 hover:bg-gray-100'}
                  >
                    {filter}
                    {filterBySourceArray.includes(filter) && (
                      <span className="text-gray-600">✓</span>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </>
          )}
        </Listbox>
        <Listbox
          value={filterByTypeArray}
          onChange={setFilterByTypeArray}
          multiple
        >
          {({ open }) => (
            <>
              <Listbox.Button
                className={`${
                  filterByTypeArray.length > 0
                    ? 'bg-gray-400 text-white'
                    : 'bg-gray-200 text-gray-600'
                } w-full px-2 py-1.5 border rounded-md flex-1 font-normal focus:outline-none focus:border-gray-400 relative`}
              >
                <FunnelIcon className="w-6 h-6 inline" />
                {!open && (
                  <div className="absolute w-4 h-4 -top-2 -right-2 leading-none flex items-center justify-center rounded-full text-[10px] text-white bg-blue-600">
                    {filterByTypeArray.length}
                  </div>
                )}
              </Listbox.Button>
              <Listbox.Options
                className={
                  'absolute w-24 text-xs bottom-0 bg-white border border-gray-200 rounded-md shadow-lg z-20'
                }
              >
                {typeFilters.map((filter, idx) => (
                  <Listbox.Option
                    key={`${filter}-${idx}`}
                    value={filter}
                    className={'px-4 py-2 hover:bg-gray-100'}
                  >
                    {filter}
                    {filterByTypeArray.includes(filter) && (
                      <span className="text-gray-600">✓</span>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </>
          )}
        </Listbox>
      </div>
    </div>
  )
}
