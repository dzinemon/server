import { useEffect, useMemo, useState } from 'react'

import {
  addUrls,
  removeUrl
} from '../../../utils/api'

import { parseUrls } from '../../../utils/links'

import toast, { Toaster } from 'react-hot-toast'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table'

import {
  ArrowPathIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LinkIcon,
  TrashIcon,
} from '@heroicons/react/24/solid'

import DialogModal from './DialogModal'

const columnHelper = createColumnHelper()

export default function DataTable({ items }) {
  const [itemToRemove, setItemToRemove] = useState({})

  const [selectedItems, setSelectedItems] = useState([])

  const [data, setData] = useState(items)

  const [filteredData, setFilteredData] = useState(items)

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')

  const handleReUpload = async (id) => {
    // reupload the item by removing it and adding it again
    const item = data.find((item) => item.id === id)
    if (!item) return

    // Check if the item has a valid URL

    if (!item.url || item.url.trim() === '') {
      console.error('Item has no valid URL to reupload')
      toast.error(`Item with id ${item.id} has no valid URL to reupload`, {
        duration: 2000,
        icon: '❌',
      })
      return
    }

    try {
      await removeUrl(item.id, item.uuids)
      // re-add the item by parsing the url and uploading it again
      const urls = parseUrls(item.url)
      if (urls.length === 0) {
        console.error('No valid URLs found to reupload')
        return
      }

      await addUrls(urls, false) // assuming internal is false for reupload

      toast.success(`Reuploaded url ${item.url} successfully!`, {
        duration: 2000,
        icon: '✅',
      })
      // re-fetch the data after reuploading
      // const updatedData = await fetchUrls()
      // setData(updatedData)
      // setFilteredData(updatedData)
      // setSelectedItems((prev) => prev.filter((itemId) => itemId !== id))
    } catch (error) {
      console.error('Error reuploading item:', error)
      toast.error(`Failed to reupload url ${item.url}`, {
        duration: 2000,
        icon: '❌',
      })
    }
  }

  const handleRemove = async (id) => {
    // remove the item by id
    const item = data.find((item) => item.id === id)
    if (!item) return

    try {
      await removeUrl(item.id, item.uuids)
      // filter out the removed item from the data
      // const newData = data.filter((item) => item.id !== id)
      // setData(newData)
      // setFilteredData(newData)
      // also remove from selected items if it was selected

      setSelectedItems((prev) => prev.filter((itemId) => itemId !== id))

      toast.success(`Removed url ${item.url} successfully!`, {
        duration: 2000,
        icon: '✅',
      })
    } catch (error) {
      console.error('Error removing item:', error)
      toast.error(`Failed to remove url ${item.url}`, {
        duration: 2000,
        icon: '❌',
      })
    }
  }

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
                {row.original.uuids[0]}
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
              {row.original.uuids.length}
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

  useEffect(() => {
    if (searchTerm === '') return setFilteredData(data)

    const filteredData = data.filter((link) => {
      return (
        link.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.uuids[0].toLowerCase().includes(searchTerm.toLowerCase())
      )
    })

    setFilteredData(filteredData)
  }, [searchTerm, data])

  if (!filteredData && filteredData.length === 0)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-900 text-lg font-semibold">No data found</div>
      </div>
    )

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
          {selectedItems.length > 0 && (
            <div className="w-auto lg:w-1/4">
              <div className="bg-rose-50 p-3 rounded-lg mb-4">
                <strong className="text-slate-600">
                  {selectedItems.length} items selected
                </strong>
                <button
                  title="Remove Selected Items"
                  aria-label="Remove Selected Items"
                  onClick={() => {
                    // remove selected items
                    selectedItems.forEach((id) => {
                      handleRemove(id)
                    })
                    setSelectedItems([])
                  }}
                  className=""
                >
                  <TrashIcon
                    className="
                      w-4 h-4 inline text-red-600"
                  />
                </button>
                {/* reupload selected items */}

                <button
                  title="Reupload Selected Items"
                  aria-label="Reupload Selected Items"
                  onClick={() => {
                    // reupload selected items
                    selectedItems.forEach((id) => {
                      handleReUpload(id)
                    })
                    // clear selected items after reuploading
                    setSelectedItems([])
                  }}
                  className="ml-2"
                >
                  <ArrowPathIcon
                    className="
                      w-4 h-4 inline text-blue-600"
                  />
                </button>
              </div>
            </div>
          )}
        </div>
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
                      const currentPageItems = table.getRowModel().rows.map(row => row.original.id)
                      if (e.target.checked) {
                        // Add current page items to selection (avoiding duplicates)
                        setSelectedItems(prev => [...new Set([...prev, ...currentPageItems])])
                      } else {
                        // Remove current page items from selection
                        setSelectedItems(prev => prev.filter(id => !currentPageItems.includes(id)))
                      }
                    }}
                    checked={
                      table.getRowModel().rows.length > 0 && 
                      table.getRowModel().rows.every(row => selectedItems.includes(row.original.id))
                    }
                    indeterminate={
                      table.getRowModel().rows.some(row => selectedItems.includes(row.original.id)) &&
                      !table.getRowModel().rows.every(row => selectedItems.includes(row.original.id))
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
                        setSelectedItems((prev) => [...prev, row.original.id])
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
                    <TrashIcon
                      className="w-4 h-4 text-red-600 cursor-pointer"
                      title="Remove Item"
                      aria-label="Remove Item"
                      onClick={() => {
                        setItemToRemove(row.original)
                        setIsDialogOpen(true)
                      }}
                    />
                    {/* Add reupload action to remove and add the url again by parsing and uploading to database */}
                    <ArrowPathIcon
                      className="w-4 h-4 text-blue-600 cursor-pointer ml-2"
                      title="Reupload Item"
                      aria-label="Reupload Item"
                      onClick={() => handleReUpload(row.original.id)}
                    />
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

      <DialogModal open={isDialogOpen} setOpen={setIsDialogOpen}>
        <div className="space-y-2">
          <p className="text-lg font-medium leading-6 text-rose-600">
            Delete Item
          </p>
          <p className="text-sm text-gray-500">
            Item Will be deleted permanently. Are you sure you want to delete
            this item?
          </p>
          { 
            itemToRemove
           && itemToRemove.id && (
            <div>
              <p className="text-slate-700">{itemToRemove.name}</p>
              <p className="text-xs text-slate-500">
                id <strong>{itemToRemove.id}</strong> & associated{' '}
                <strong>{itemToRemove.uuids.length}</strong> uuids/chunks
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 items-center flex space-x-4">
          <button
            type="button"
            className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
            onClick={
              () => setIsDialogOpen(false)
            }
          >
            Cancel
          </button>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-rose-100 px-4 py-2 text-sm font-medium text-rose-500 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            onClick={() => {
              handleRemove(itemToRemove.id, itemToRemove.uuids)
              setIsDialogOpen(false)
            }}
          >
            <TrashIcon
              className="h-4 w-4 text-rose-500"
            />{' '}
            Yes Remove
          </button>
        </div>
      </DialogModal>
      <Toaster />
    </>
  )
}
