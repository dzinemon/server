import { useEffect, useState, useMemo } from 'react'

import { useResources } from '@/context/resources'

import {
  useReactTable,
  createColumnHelper,
  flexRender,
  getRowModel,
  getCoreRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table'

import {
  DocumentMagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/24/solid'

import QuestionDialogModal from './QuestionDialogModal'

const columnHelper = createColumnHelper()

export default function AllQuestionsDataTable() {
  const { allQuestions, loading, fetchAllQuestions } = useResources()
  const [itemToRemove, setItemToRemove] = useState({})

  const [filteredData, setFilteredData] = useState([])

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')

  const [pagination, setPagination] = useState({
    pageIndex: 0, //initial page index
    pageSize: 20, //default page size
  })

  const handleRemove = async (id) => {
    const res = await fetch(`/api/questions/${id}`, {
      method: 'DELETE',
    }).then(res => {
      return res.json()
    }).then(data => {
      console.log(data)
      const qs = allQuestions.filter((link) => {
        return link.id !== id
      }
      )
      setFilteredData(qs)
    })
      .catch(error => console.error('Error:', error))
    console.log(res)
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        cell: ({ row }) => (
          <div>
            {row.original.id}
          </div>
        ),
        header: 'Id',
      }),
      columnHelper.accessor('question', {
        cell: ({ row }) => (
          <div className="text-clip">
            <button
              className='hover:text-blue-600 cursor-pointer text-sm text-gray-900'
              onClick={() => {
                setItemToRemove(row.original)
                setIsDialogOpen(true)
              }}  
            >
              {row.original.question}
            </button>
          </div>
        ),
        header: 'Question',
      }),
      columnHelper.accessor('resources', {
        cell: ({ row }) => {
          const resources = JSON.parse(row.original.resources)
          return (
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {resources.length}
              </p>
            </div>
          )
        },
        header: 'Resources',
      }),
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
    fetchAllQuestions()
  }, [])

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
      <div className='lg:container mt-4'>
        <div className="bg-white p-3 rounded-xl">
          <div className="flex justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                <strong className="text-slate-400">
                  {JSON.stringify(allQuestions.length)}
                </strong>{' '}
                Questions
              </h2>
            </div>
            <div>
              {loading && (
                <div className="text-xs text-slate-500">Loading...</div>
              )}
              {!loading && (
                <div className="text-xs flex items-center text-slate-500 space-x-2">
                  <div>Last updated: {new Date().toLocaleString()}</div>
        
                  <button
                    onClick={
                      () => fetchAllQuestions()
                    }
                    className="border rounded p-1 bg-slate-100 hover:bg-slate-200 text-slate-500"
                  >
                    Refresh
                  </button>
        
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3 mb-4 bg-slate-50 p-3 rounded-lg">
            <div>Search </div>
            <input
              type="text"
              placeholder="search by name"
              value={searchTerm}
              className="border p-1 rounded w-64"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <table className="table-auto bg-white w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup, idx) => (
                <tr key={headerGroup.id}>
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
                        setItemToRemove(row.original)
                        setIsDialogOpen(true)
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

      <QuestionDialogModal
        data={itemToRemove}
        handleRemove={handleRemove}
        open={isDialogOpen}
        setOpen={setIsDialogOpen}
      />
    </>
  )
}
