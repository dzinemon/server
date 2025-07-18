import { lazy, Suspense, useCallback, useEffect, useState, useRef } from 'react'

import { useResources } from '@/context/resources'

import toast, { Toaster } from 'react-hot-toast'

import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentMagnifyingGlassIcon,
} from '@heroicons/react/24/solid'

const Loading = () => (
  <div className="flex items-center justify-center h-32">
    <svg
      className="animate-spin h-6 w-6 text-blue-500 mr-2"
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
        d="M4 12a8 8 0 018-8v8z"
      ></path>
    </svg>
    <span className="text-slate-600 text-sm">Loading...</span>
  </div>
)

const QuestionDialogModal = lazy(() => import('./QuestionDialogModal'))

export default function AllQuestionsDataTable() {
  const {
    allQuestions,
    loading,
    fetchAllQuestions,
    fetchQuestionById,
    handleQuestionDelete,
    removeMultipleQuestionsById,
    pagination,
    searchTerm,
    setSearchTerm,
    isInitialized,
  } = useResources()

  const [selectedItems, setSelectedItems] = useState([])
  const [itemToRemove, setItemToRemove] = useState({})
  const [fetchedItems, setFetchedItems] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Refs to track search state and prevent unnecessary selection clearing
  const isSearchingRef = useRef(false)
  const lastSearchTermRef = useRef(null) // Start with null to detect initial load

  // Handle page changes
  const handlePageChange = useCallback(
    (newPage) => {
      fetchAllQuestions(newPage, pagination.pageSize, searchTerm)
      setSelectedItems([]) // Clear selections when changing pages
    },
    [fetchAllQuestions, pagination.pageSize, searchTerm]
  )

  // Handle page size changes
  const handlePageSizeChange = useCallback(
    (newPageSize) => {
      fetchAllQuestions(1, newPageSize, searchTerm) // Reset to page 1 when changing page size
      setSelectedItems([]) // Clear selections when changing page size
    },
    [fetchAllQuestions, searchTerm]
  )

  // Debounced search effect - trigger for any search term change
  useEffect(() => {
    // Only proceed if search term actually changed
    if (lastSearchTermRef.current === searchTerm) {
      return
    }

    const previousSearchTerm = lastSearchTermRef.current
    lastSearchTermRef.current = searchTerm
    isSearchingRef.current = true

    const timeoutId = setTimeout(() => {
      fetchAllQuestions(1, pagination.pageSize, searchTerm)
      // Only clear selections if this is a user-initiated search change
      // (not initial load or programmatic reset)
      if (previousSearchTerm !== null && previousSearchTerm !== searchTerm) {
        setSelectedItems([])
      }
      isSearchingRef.current = false
    }, 1000)

    return () => {
      clearTimeout(timeoutId)
      isSearchingRef.current = false
    }
  }, [searchTerm, fetchAllQuestions, pagination.pageSize])

  // Initial data load - separate from search
  useEffect(() => {
    if (!isInitialized) {
      fetchAllQuestions(1, pagination.pageSize, '', true) // Show toast on initial load
    }
  }, [fetchAllQuestions, pagination.pageSize, isInitialized])

  const handleSetCurrentQuestion = useCallback(
    async (id) => {
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
    },
    [fetchedItems, fetchQuestionById]
  )

  const handleRemove = async (id) => {
    try {
      await handleQuestionDelete(id)
      setIsDialogOpen(false)
      setFetchedItems((prev) => prev.filter((item) => item.id !== id))
      setItemToRemove({})
    } catch (error) {
      console.error('Error deleting question:', error)
      toast.error('Error deleting question', {
        icon: '❌',
        duration: 2500,
      })
    }
  }

  if (!allQuestions || allQuestions.length === 0) {
    if (loading) {
      return <Loading />
    }

    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-gray-900 text-lg font-semibold mb-2">
            {searchTerm ? 'No questions found' : 'No questions available'}
          </div>
          {searchTerm && (
            <div className="text-gray-500 text-sm">
              Try adjusting your search term
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="lg:container mt-4">
        <div className="bg-white p-3 rounded-xl">
          <div className="flex justify-between mb-4">
            <div className="flex items-center justify-between w-full">
              <h2 className="text-2xl font-semibold text-gray-900 grow">
                <strong className="text-slate-400">
                  {pagination.totalItems}
                </strong>{' '}
                Questions{' '}
              </h2>
              <div className="px-2 w-auto">
                {loading ? (
                  <div className="text-xs text-slate-500">Loading...</div>
                ) : (
                  <div className="text-xs text-slate-500">
                    Page {pagination.currentPage} of {pagination.totalPages}
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
                placeholder="search by question text"
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
            <thead className="bg-slate-100">
              <tr>
                <th className="px-2 py-1 border w-20">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems(allQuestions.map((item) => item.id))
                      } else {
                        setSelectedItems([])
                      }
                    }}
                    checked={
                      selectedItems.length === allQuestions.length &&
                      allQuestions.length > 0
                    }
                  />
                </th>
                <th className="px-2 py-1 border">Id</th>
                <th className="px-2 py-1 border">Question</th>
                <th className="px-2 py-1 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allQuestions.map((question, idx) => (
                <tr key={question.id}>
                  <td className="px-2 py-1 border text-center">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(question.id)}
                      className="cursor-pointer"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems((prev) => [...prev, question.id])
                        } else {
                          setSelectedItems((prev) =>
                            prev.filter((item) => item !== question.id)
                          )
                        }
                      }}
                    />
                  </td>
                  <td className="px-2 py-1 border">{question.id}</td>
                  <td className="px-2 py-1 border">
                    <button
                      className="hover:text-blue-600 cursor-pointer text-sm text-gray-900 text-left"
                      onClick={() => {
                        handleSetCurrentQuestion(question.id)
                      }}
                    >
                      {question.question}
                    </button>
                  </td>
                  <td className="px-2 py-1 border">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        title="View Question Details"
                        aria-label="View Question Details"
                        className="text-slate-600 hover:text-blue-600 cursor-pointer"
                        onClick={() => {
                          handleSetCurrentQuestion(question.id)
                        }}
                      >
                        <DocumentMagnifyingGlassIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="h-2" />
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
            <span className="flex items-center gap-1">
              | Go to page:
              <input
                type="number"
                min="1"
                max={pagination.totalPages}
                value={pagination.currentPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value)
                  if (page >= 1 && page <= pagination.totalPages) {
                    handlePageChange(page)
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const page = parseInt(e.target.value)
                    if (page >= 1 && page <= pagination.totalPages) {
                      handlePageChange(page)
                    }
                  }
                }}
                className="border p-1 rounded w-16"
              />
            </span>
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
          </div>
          <div>
            Showing {allQuestions.length} of {pagination.totalItems} Questions
          </div>
        </div>
      </div>
      <Toaster />
      <Suspense fallback={Loading}>
        <QuestionDialogModal
          data={itemToRemove}
          handleRemove={handleRemove}
          open={isDialogOpen}
          setOpen={setIsDialogOpen}
        />
      </Suspense>
    </>
  )
}
