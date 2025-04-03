import { useEffect, useMemo, useState } from 'react'

import { useResources } from '@/context/resources'

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
  DocumentMagnifyingGlassIcon,
} from '@heroicons/react/24/solid'

import QuestionDialogModal from './QuestionDialogModal'

const columnHelper = createColumnHelper()

export default function AllQuestionsDataTable() {
  const {
    allQuestions,
    loading,
    fetchAllQuestions,
    fetchQuestionById,
    handleQuestionDelete,
    removeMultipleQuestionsById,
  } = useResources()

  const [selectedItems, setSelectedItems] = useState([])

  const [itemToRemove, setItemToRemove] = useState({})

  const [fetchedItems, setFetchedItems] = useState([])

  const [filteredData, setFilteredData] = useState([])

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')

  const [pagination, setPagination] = useState({
    pageIndex: 0, //initial page index
    pageSize: 20, //default page size
  })
  const handleSetCurrentQuestion = async (id) => {
    const existingItem = fetchedItems.find((item) => item.id === id)
    if (existingItem) {
      setItemToRemove(existingItem)
    } else {
      const res = await fetchQuestionById(id)
      console.log(res)
      setItemToRemove(res)
      setFetchedItems((prev) => [...prev, res])
    }
    setIsDialogOpen(true)
  }

  const handleRemove = async (id) => {
    try {
      await handleQuestionDelete(id)
      setIsDialogOpen(false)
      // update fetched Items
      setFetchedItems((prev) => prev.filter((item) => item.id !== id))
      // update item to remove
      setItemToRemove({})
    } catch (error) {
      console.error('Error deleting question:', error)
      toast.error('Error deleting question', {
        icon: '❌',
        duration: 2500,
      })
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        cell: ({ row }) => <div>{row.original.id}</div>,
        header: 'Id',
      }),
      columnHelper.accessor('question', {
        cell: ({ row }) => (
          <div className="text-clip">
            <button
              className="hover:text-blue-600 cursor-pointer text-sm text-gray-900"
              onClick={() => {
                handleSetCurrentQuestion(row.original.id)
              }}
            >
              {row.original.question}
            </button>
          </div>
        ),
        header: 'Question',
      }),
      // columnHelper.accessor('resources', {
      //   cell: ({ row }) => {
      //     const resources = JSON.parse(row.original.resources)
      //     return (
      //       <div>
      //         <p className="text-sm font-semibold text-gray-900">
      //           {resources.length}
      //         </p>
      //       </div>
      //     )
      //   },
      //   header: 'Resources',
      // }),
    ],
    [allQuestions]
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

  useEffect(() => {
    if (searchTerm === '') return setFilteredData(allQuestions)

    const filteredData = allQuestions.filter((link) => {
      return link.question.toLowerCase().includes(searchTerm.toLowerCase())
    })

    setFilteredData(filteredData)
  }, [searchTerm])

  useEffect(() => {
    setFilteredData(allQuestions)
  }, [allQuestions])

  if (!filteredData && filteredData.length === 0)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-900 text-lg font-semibold">No data found</div>
      </div>
    )

  return (
    <>
      <div className="lg:container mt-4">
        <div className="bg-white p-3 rounded-xl">
          <div className="flex justify-between mb-4">
            <div className='flex items-center justify-between w-full'>
              <h2 className="text-2xl font-semibold text-gray-900 grow">
                <strong className="text-slate-400">
                  {JSON.stringify(allQuestions.length)}
                </strong>{' '}
                Questions{' '}
            
              </h2>
              <div className='px-2  w-auto'>
              {loading ?  (
                    <div className="text-xs text-slate-500">Loading...</div>
                  ) : (
                    <div className="text-xs flex flex-col items-start text-slate-500">
                      

                      <button
                        onClick={() => fetchAllQuestions()}
                        className="border border-slate-200 rounded px-1 py-0.5 bg-slate-50 hover:bg-slate-200 text-slate-800"
                      >
                        Pull Latest Questions
                      </button>
                      <div className='text-xs'>Last updated: {new Date().toLocaleString()}</div>
                    </div>
                  )}

              </div>
            </div>
          </div>
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
            {selectedItems.length > 0 && (
              <div className="w-auto lg:w-1/4">
                <div className="bg-rose-50 p-3 rounded-lg mb-4">
                  <strong className="text-slate-600">
                    {selectedItems.length} items selected
                  </strong>
                  <button
                    onClick={() => {
                      removeMultipleQuestionsById(selectedItems)
                      setSelectedItems([])
                    }}
                    className="border text-sm rounded px-2 py-1 bg-red-500 hover:bg-red-600 text-white"
                  >
                    Remove Selected
                  </button>
                </div>
              </div>
            )}
          </div>

          <table className="table-auto bg-white w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup, idx) => (
                <tr key={headerGroup.id}>
                  <th className="px-2 py-1 border w-20">
                    Select
                    <input
                      className="hidden"
                      id={`select-header-${idx}`}
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(filteredData.map((item) => item.id))
                        } else {
                          setSelectedItems([])
                        }
                      }}
                      checked={selectedItems.length === filteredData.length}
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
                  <td className="px-2 py-1 border text-center">
                    <input
                      type="checkbox"
                      id={`select-body-${idx}`}
                      checked={selectedItems.includes(row.original.id)}
                      className="cursor-pointer"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems((prev) => [...prev, row.original.id])
                        } else {
                          setSelectedItems((prev) =>
                            prev.filter((item) => item !== row.original.id)
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
                  <td className="px-2 py-1 border">
                    <DocumentMagnifyingGlassIcon
                      className="w-4 h-4 text-slate-600 hover:text-blue-600 cursor-pointer"
                      onClick={() => {
                        handleSetCurrentQuestion(row.original.id)
                      }}
                    />
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
                id={`page-${table.getState().pagination.pageIndex}`}
                defaultValue={table.getState().pagination.pageIndex + 1}
                onChange={(e) => {
                  const page = e.target.value ? Number(e.target.value) - 1 : 0
                  table.setPageIndex(page)
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
        </div>
      </div>
      <Toaster />
      <QuestionDialogModal
        data={itemToRemove}
        handleRemove={handleRemove}
        open={isDialogOpen}
        setOpen={setIsDialogOpen}
      />
    </>
  )
}
