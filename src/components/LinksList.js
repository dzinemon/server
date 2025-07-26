import { useEffect, useState, useCallback, useRef } from 'react'
import { addUrls, removeAllUrls, removeUrl } from '../../utils/api'
import { parseUrls } from '../../utils/links'
import { useLinks } from '@/context/links'

import { ArrowPathIcon, LinkIcon, TrashIcon } from '@heroicons/react/24/solid'
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/solid'

import toast from 'react-hot-toast'
import Loading from './Loading'

function LinksList() {
  const {
    loading,
    allLinks,
    fetchAllLinks,
    removeMultipleLinksById,
    handleLinkDelete,
    pagination,
    searchTerm,
    setSearchTerm,
    isInitialized,
  } = useLinks()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedItems, setSelectedItems] = useState([])

  const initialFormState = {
    url: '',
    urls: '',
    internal: false,
  }

  const [formState, setFormState] = useState(initialFormState)

  // Refs to track search state
  const isSearchingRef = useRef(false)
  const lastSearchTermRef = useRef(null)

  // Handle page changes
  const handlePageChange = useCallback(
    (newPage) => {
      fetchAllLinks(newPage, pagination.pageSize, searchTerm)
      setSelectedItems([]) // Clear selections when changing pages
    },
    [fetchAllLinks, pagination.pageSize, searchTerm]
  )

  // Handle page size changes
  const handlePageSizeChange = useCallback(
    (newPageSize) => {
      fetchAllLinks(1, newPageSize, searchTerm) // Reset to page 1 when changing page size
      setSelectedItems([]) // Clear selections when changing page size
    },
    [fetchAllLinks, searchTerm]
  )

  // Debounced search effect
  useEffect(() => {
    if (lastSearchTermRef.current === searchTerm) {
      return
    }

    const previousSearchTerm = lastSearchTermRef.current
    lastSearchTermRef.current = searchTerm
    isSearchingRef.current = true

    const timeoutId = setTimeout(() => {
      fetchAllLinks(1, pagination.pageSize, searchTerm)
      if (previousSearchTerm !== null && previousSearchTerm !== searchTerm) {
        setSelectedItems([])
      }
      isSearchingRef.current = false
    }, 1000) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchTerm, fetchAllLinks, pagination.pageSize])

  // Load initial data
  useEffect(() => {
    if (!isInitialized) {
      fetchAllLinks()
    }
  }, [isInitialized, fetchAllLinks])

  const handleSubmitMultiple = async (e) => {
    e.preventDefault()
    const urls = parseUrls(formState.urls)
    if (!urls.length) {
      toast.error('Please enter at least one valid URL', {
        duration: 2000,
        icon: '⚠️',
      })
      return
    }

    setIsSubmitting(true)
    try {
      await addUrls(urls, formState.internal)
      setFormState(initialFormState)

      // Refresh the data
      await fetchAllLinks(
        pagination.currentPage,
        pagination.pageSize,
        searchTerm
      )

      toast.success(
        `Successfully added ${urls.length} URL${urls.length > 1 ? 's' : ''}!`,
        {
          duration: 2000,
          icon: '✅',
        }
      )
    } catch (error) {
      console.error('Error adding URLs:', error)
      toast.error('Failed to add URLs. Please try again.', {
        duration: 2000,
        icon: '❌',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemove = async (id) => {
    const item = allLinks.find((item) => item.id === id)
    if (!item) return

    try {
      await removeUrl(item.id, item.uuids)
      await fetchAllLinks(
        pagination.currentPage,
        pagination.pageSize,
        searchTerm
      )

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

  const handleReUpload = async (id) => {
    const item = allLinks.find((item) => item.id === id)
    if (!item) return

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
      const urls = parseUrls(item.url)
      if (urls.length === 0) {
        console.error('No valid URLs found to reupload')
        toast.error('No valid URLs found to reupload', {
          duration: 2000,
          icon: '❌',
        })
        return
      }

      const isInternal = item.internal || false
      await addUrls(urls, isInternal)
      await fetchAllLinks(
        pagination.currentPage,
        pagination.pageSize,
        searchTerm
      )

      toast.success(`Reuploaded url ${item.url} successfully!`, {
        duration: 2000,
        icon: '✅',
      })
    } catch (error) {
      console.error('Error reuploading item:', error)
      toast.error(`Failed to reupload url ${item.url}`, {
        duration: 2000,
        icon: '❌',
      })
    }
  }

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return

    try {
      await Promise.all(
        selectedItems.map(async (id) => {
          const item = allLinks.find((item) => item.id === id)
          if (item) {
            await removeUrl(item.id, item.uuids)
          }
        })
      )

      setSelectedItems([])
      await fetchAllLinks(
        pagination.currentPage,
        pagination.pageSize,
        searchTerm
      )

      toast.success(`Removed ${selectedItems.length} URLs successfully!`, {
        duration: 2000,
        icon: '✅',
      })
    } catch (error) {
      console.error('Error removing items:', error)
      toast.error('Failed to remove URLs', {
        duration: 2000,
        icon: '❌',
      })
    }
  }

  return (
    <div className="py-12">
      <div className="bg-slate-200 p-4 rounded-lg mb-6">
        <form onSubmit={handleSubmitMultiple}>
          <h2 className="text-base font-semibold leading-7 text-gray-900">
            Add multiple URLs to Knowledge base
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Multiple URLs separated by line breaks, commas, or spaces
          </p>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="link-url"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                <LinkIcon className="text-gray-600 w-4 h-4 inline" /> URLs
              </label>
              <textarea
                onChange={(e) =>
                  setFormState({ ...formState, urls: e.target.value })
                }
                value={formState.urls}
                type="text"
                name="link-url"
                id="link-url"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="https://example.com"
                rows="5"
              />
            </div>
            <div className="flex items-center">
              <input
                id="internal"
                name="internal"
                type="checkbox"
                checked={formState.internal}
                onChange={(e) =>
                  setFormState({ ...formState, internal: e.target.checked })
                }
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label
                htmlFor="internal"
                className="ml-2 block text-sm text-gray-900"
              >
                Mark as internal content
              </label>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-end gap-x-6">
            <button
              disabled={isSubmitting}
              type="submit"
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Adding...' : 'Add URLs'}
            </button>
          </div>
        </form>
      </div>

      {/* Search and Controls */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="grow flex items-center space-x-3 mb-4 bg-slate-50 p-3 rounded-lg">
            <div>Search </div>
            <input
              type="text"
              name="search"
              placeholder="search by name or URL"
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
                  onClick={handleBulkDelete}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="w-4 h-4 inline" /> Delete Selected
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {loading && !isInitialized ? (
        <Loading />
      ) : allLinks.length === 0 && !loading ? (
        <div className="flex items-center justify-center h-32 border border-gray-200 rounded-lg bg-gray-50">
          <div className="text-center">
            <div className="text-gray-500 text-lg font-medium">
              No links found
            </div>
            <div className="text-gray-400 text-sm mt-1">
              {searchTerm ? (
                <>
                  No results for &ldquo;{searchTerm}&rdquo;.{' '}
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-blue-500 hover:text-blue-700 underline"
                  >
                    Clear search
                  </button>
                </>
              ) : (
                'Add some URLs to get started'
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Data Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={
                        allLinks.length > 0 &&
                        allLinks.every((link) =>
                          selectedItems.includes(link.id)
                        )
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(allLinks.map((link) => link.id))
                        } else {
                          setSelectedItems([])
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chunks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allLinks.map((link) => (
                  <tr key={link.id}>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(link.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems([...selectedItems, link.id])
                          } else {
                            setSelectedItems(
                              selectedItems.filter((id) => id !== link.id)
                            )
                          }
                        }}
                      />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {link.id}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{link.name}</div>
                      <div className="text-xs text-gray-500">
                        {link.uuids?.[0] || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <LinkIcon className="w-4 h-4 inline" />
                      </a>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {link.uuids?.length || 0}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {link.created_at
                        ? new Date(link.created_at).toLocaleDateString(
                            'en-US',
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )
                        : 'N/A'}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleReUpload(link.id)}
                        className="text-blue-600 hover:text-blue-900 mr-2"
                      >
                        <ArrowPathIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemove(link.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                className="border rounded p-1 disabled:opacity-50"
                onClick={() => handlePageChange(1)}
                disabled={!pagination.hasPreviousPage || loading}
              >
                <ChevronDoubleLeftIcon className="w-4 h-4" />
              </button>
              <button
                className="border rounded p-1 disabled:opacity-50"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPreviousPage || loading}
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <button
                className="border rounded p-1 disabled:opacity-50"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage || loading}
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
              <button
                className="border rounded p-1 disabled:opacity-50"
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={!pagination.hasNextPage || loading}
              >
                <ChevronDoubleRightIcon className="w-4 h-4" />
              </button>
              <span className="flex items-center gap-1">
                <div>Page</div>
                <strong>
                  {pagination.currentPage} of {pagination.totalPages}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={pagination.pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                disabled={loading}
              >
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    Show {pageSize}
                  </option>
                ))}
              </select>
              <div className="text-sm text-gray-500">
                Showing {(pagination.currentPage - 1) * pagination.pageSize + 1}{' '}
                to{' '}
                {Math.min(
                  pagination.currentPage * pagination.pageSize,
                  pagination.totalItems
                )}{' '}
                of {pagination.totalItems} results
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default LinksList
