import { useEffect, useMemo, useState, useCallback } from 'react'

import toast, { Toaster } from 'react-hot-toast'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'

import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LinkIcon,
  TrashIcon,
} from '@heroicons/react/24/solid'

import DialogModal from './DialogModal'

const columnHelper = createColumnHelper()

// Custom hook for debounced search
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function ServerDataTable({ items, actions = [] }) {
  const [itemToRemove, setItemToRemove] = useState({})

  const [selectedItems, setSelectedItems] = useState([])

  const [data, setData] = useState(items)

  const [filteredData, setFilteredData] = useState(items)

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [isBulkOperationLoading, setIsBulkOperationLoading] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')

  // Debounce search term to improve performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Update data when items prop changes
  useEffect(() => {
    setData(items)
    setFilteredData(items)
    // Clear selection when data changes to avoid stale selections
    setSelectedItems([])
  }, [items])

  // Get actions that support bulk operations
  const bulkActions = actions.filter((action) => action.showInBulk)

  // Get the remove action for confirmation modal
  const removeAction = actions.find((action) => action.key === 'remove')

  const [pagination, setPagination] = useState({
    pageIndex: 0, //initial page index
    pageSize: 20, //default page size
  })

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        cell: ({ row }) => (
          <div>
            {/* <button
            onClick={row.value}
            className="text-sm font-semibold text-gray-900"
          >
            {row.value}
          </button> */}
            {row.original.id}
          </div>
        ),
        header: 'Id',
      }),
      columnHelper.accessor('name', {
        cell: ({ row }) => (
          <div className="text-clip">
            <p className="text-sm text-gray-900 ">
              {row.original.name}
              <span className="bg-gray-50 text-xs px-1 font-light text-gray-500">
                {row.original.uuids?.[0] || 'N/A'}
              </span>
            </p>
          </div>
        ),
        header: 'Name',
      }),
      columnHelper.accessor('url', {
        cell: ({ row }) => (
          <div>
            <a
              href={row.original.url}
              className="text-sm font-semibold text-blue-600 hover:text-gray-900"
            >
              <LinkIcon className="w-4 h-4 inline" />
            </a>
          </div>
        ),
        header: 'Url/Link',
      }),
      columnHelper.accessor('uuids', {
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {row.original.uuids?.length || 0}
            </p>
          </div>
        ),
        header: 'Chunks',
      }),
    ],
    []
  )

  const table = useReactTable({
    columns,
    data: filteredData, //also good to use a fallback array that is defined outside of the component (stable reference)
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination, //update the pagination state when internal APIs mutate the pagination state
    state: {
      //...
      pagination,
    },
  })

  // Search filtering with debounced search term
  useEffect(() => {
    if (debouncedSearchTerm === '') return setFilteredData(data)

    const filtered = data.filter((link) => {
      // Safe access to prevent crashes when properties are missing
      const name = link.name?.toLowerCase() || ''
      const url = link.url?.toLowerCase() || ''
      const firstUuid = link.uuids?.[0]?.toLowerCase() || ''

      const searchLower = debouncedSearchTerm.toLowerCase()

      return (
        name.includes(searchLower) ||
        url.includes(searchLower) ||
        firstUuid.includes(searchLower)
      )
    })

    setFilteredData(filtered)
  }, [debouncedSearchTerm, data])

  // Clear selection when page changes
  const handlePageChange = useCallback(
    (pageIndex) => {
      table.setPageIndex(pageIndex)
      // Optionally clear selection on page change
      // setSelectedItems([])
    },
    [table]
  )

  // Only show "No data found" if there's no initial data at all
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-900 text-lg font-semibold">No data found</div>
      </div>
    )
  }

  return (
    <>
      <div className="">
        <h2 className="text-lg font-semibold text-gray-900">Uploaded Items</h2>
        <div className="flex flex-wrap gap-4">
          <div className="grow flex items-center space-x-3 mb-4 bg-slate-50 p-3 rounded-lg">
            <div>Search </div>
            <input
              type="text"
              name="search"
              placeholder="search by name"
              value={searchTerm}
              className="border p-1 rounded w-64"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {selectedItems.length > 0 && bulkActions.length > 0 && (
            <div className="w-auto lg:w-1/4">
              <div className="bg-rose-50 p-3 rounded-lg mb-4">
                <strong className="text-slate-600">
                  {selectedItems.length} items selected
                </strong>
                {bulkActions.map((action) => {
                  const IconComponent = action.icon
                  return (
                    <button
                      key={action.key}
                      title={action.title}
                      aria-label={action.title}
                      disabled={isBulkOperationLoading}
                      onClick={async () => {
                        setIsBulkOperationLoading(true)
                        try {
                          // Execute bulk operations with some delay to show loading state
                          await Promise.all(
                            selectedItems.map((id) => action.handler(id))
                          )
                          setSelectedItems([])
                          toast.success(
                            `Bulk ${action.title.toLowerCase()} completed!`,
                            {
                              duration: 2000,
                              icon: '✅',
                            }
                          )
                        } catch (error) {
                          console.error(`Bulk ${action.title} failed:`, error)
                          toast.error(
                            `Bulk ${action.title.toLowerCase()} failed`,
                            {
                              duration: 2000,
                              icon: '❌',
                            }
                          )
                        } finally {
                          setIsBulkOperationLoading(false)
                        }
                      }}
                      className={`${action.className || 'ml-2'} ${
                        isBulkOperationLoading
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                    >
                      {isBulkOperationLoading ? (
                        <svg
                          className="animate-spin w-4 h-4 inline"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      ) : (
                        <IconComponent
                          className={action.iconClassName || 'w-4 h-4 inline'}
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
        {filteredData && filteredData.length === 0 ? (
          <div className="flex items-center justify-center h-32 border border-gray-200 rounded-lg bg-gray-50">
            <div className="text-center">
              <div className="text-gray-500 text-lg font-medium">
                No results found
              </div>
              <div className="text-gray-400 text-sm mt-1">
                Try adjusting your search terms or{' '}
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-blue-500 hover:text-blue-700 underline"
                >
                  clear search
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <table className="table-auto bg-white w-full">
              <thead className="bg-gray-100">
                {table.getHeaderGroups().map((headerGroup, idx) => (
                  <tr key={headerGroup.id}>
                    <th className="px-2 py-1 border">
                      <span className="hidden">Select</span>
                      <input
                        type="checkbox"
                        id={`select-header-${idx}`}
                        onChange={(e) => {
                          const currentPageItems = table
                            .getRowModel()
                            .rows.map((row) => row.original.id)
                          if (e.target.checked) {
                            // Add current page items to selection (avoiding duplicates)
                            setSelectedItems((prev) => [
                              ...new Set([...prev, ...currentPageItems]),
                            ])
                          } else {
                            // Remove current page items from selection
                            setSelectedItems((prev) =>
                              prev.filter(
                                (id) => !currentPageItems.includes(id)
                              )
                            )
                          }
                        }}
                        checked={
                          table.getRowModel().rows.length > 0 &&
                          table
                            .getRowModel()
                            .rows.every((row) =>
                              selectedItems.includes(row.original.id)
                            )
                        }
                        indeterminate={
                          table
                            .getRowModel()
                            .rows.some((row) =>
                              selectedItems.includes(row.original.id)
                            ) &&
                          !table
                            .getRowModel()
                            .rows.every((row) =>
                              selectedItems.includes(row.original.id)
                            )
                            ? true
                            : undefined
                        }
                      />
                    </th>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        colSpan={header.colSpan}
                        className="px-2 py-1 border"
                      >
                        {/* Handles all possible header column def scenarios for `header` */}
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </th>
                    ))}
                    <th className="px-2 py-1 border">Actions</th>
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row, idx) => (
                  <tr key={row.id}>
                    <td className="px-2 py-1 border">
                      <input
                        type="checkbox"
                        id={`select-row-${idx}`}
                        checked={selectedItems.includes(row.original.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems((prev) => [
                              ...prev,
                              row.original.id,
                            ])
                          } else {
                            setSelectedItems((prev) =>
                              prev.filter((id) => id !== row.original.id)
                            )
                          }
                        }}
                      />
                    </td>
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <td className="px-2 py-1 border" key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      )
                    })}
                    <td className="px-2 py-1 border ">
                      <div className="flex items-center gap-2">
                        {actions.map((action) => {
                          const IconComponent = action.icon
                          return (
                            <IconComponent
                              key={action.key}
                              className={
                                action.iconClassName || 'w-4 h-4 cursor-pointer'
                              }
                              title={action.title}
                              aria-label={action.title}
                              onClick={() => {
                                if (action.key === 'remove') {
                                  setItemToRemove(row.original)
                                  setIsDialogOpen(true)
                                } else {
                                  action.handler(row.original.id)
                                }
                              }}
                            />
                          )
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="h-2" />
            <div className="flex items-center gap-2">
              <button
                className="border rounded p-1"
                onClick={() => table.firstPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronDoubleLeftIcon className="w-4 h-4" />
              </button>
              <button
                className="border rounded p-1"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <button
                className="border rounded p-1"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
              <button
                className="border rounded p-1"
                onClick={() => table.lastPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronDoubleRightIcon className="w-4 h-4" />
              </button>
              <span className="flex items-center gap-1">
                <div>Page</div>
                <strong>
                  {table.getState().pagination.pageIndex + 1} of{' '}
                  {table.getPageCount().toLocaleString()}
                </strong>
              </span>
              <span className="flex items-center gap-1">
                | Go to page:
                <input
                  type="number"
                  min="1"
                  max={table.getPageCount()}
                  defaultValue={table.getState().pagination.pageIndex + 1}
                  onChange={(e) => {
                    const page = e.target.value ? Number(e.target.value) - 1 : 0
                    const maxPage = table.getPageCount() - 1
                    const validPage = Math.max(0, Math.min(page, maxPage))
                    handlePageChange(validPage)
                  }}
                  className="border p-1 rounded w-16"
                />
              </span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value))
                }}
              >
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    Show {pageSize}
                  </option>
                ))}
              </select>
            </div>
            <div>
              Showing {table.getRowModel().rows.length.toLocaleString()} of{' '}
              {table.getRowCount().toLocaleString()} Rows
            </div>
          </>
        )}
      </div>

      <DialogModal open={isDialogOpen} setOpen={setIsDialogOpen}>
        <div className="space-y-2">
          <p className="text-lg font-medium leading-6 text-rose-600">
            Delete Item
          </p>
          <p className="text-sm text-gray-500">
            Item Will be deleted permanently. Are you sure you want to delete
            this item?
          </p>
          {itemToRemove && itemToRemove.id && (
            <div>
              <p className="text-slate-700">{itemToRemove.name}</p>
              <p className="text-xs text-slate-500">
                id <strong>{itemToRemove.id}</strong> & associated{' '}
                <strong>{itemToRemove.uuids?.length || 0}</strong> uuids/chunks
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 items-center flex space-x-4">
          <button
            type="button"
            className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
            onClick={() => setIsDialogOpen(false)}
          >
            Cancel
          </button>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-rose-100 px-4 py-2 text-sm font-medium text-rose-500 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            onClick={() => {
              if (removeAction && removeAction.handler) {
                removeAction.handler(itemToRemove.id)
              }
              setIsDialogOpen(false)
            }}
          >
            <TrashIcon className="h-4 w-4 text-rose-500" /> Yes Remove
          </button>
        </div>
      </DialogModal>
      <Toaster />
    </>
  )
}
