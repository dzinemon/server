import { createContext, useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { baseUrl, pagination as paginationConfig } from '../../utils/config'

const LinksContext = createContext()

export const LinksProvider = ({ children }) => {
  const myHeaders = new Headers()
  myHeaders.append('Content-Type', 'application/json')

  const url = `${baseUrl}/api/urls`

  const [allLinks, setAllLinks] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: paginationConfig.defaultPageSize,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [isInitialized, setIsInitialized] = useState(false)

  const fetchAllLinks = async (
    page = 1,
    pageSize = paginationConfig.defaultPageSize,
    search = '',
    showSuccessToast = false
  ) => {
    // Prevent multiple simultaneous loads
    if (loading) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      })

      if (search) {
        params.append('search', search)
      }

      const res = await fetch(`${url}?${params}`, {
        next: { revalidate: 86400 },
      })
      const response = await res.json()

      setAllLinks(response.data || [])
      setPagination(
        response.pagination || {
          currentPage: 1,
          pageSize: paginationConfig.defaultPageSize,
          totalItems: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      )

      // Mark as initialized after first successful load
      if (!isInitialized) {
        setIsInitialized(true)
      }

      // Only show success toast when explicitly requested (like manual refresh)
      if (showSuccessToast) {
        toast.success('Links loaded', {
          icon: '✅',
          duration: 2500,
        })
      }
    } catch (error) {
      console.error('Failed to fetch links:', error)
      toast.error('Error fetching links', {
        icon: '❌',
        duration: 2500,
      })
    } finally {
      setLoading(false)
    }
  }

  const removeMultipleLinksById = async (ids) => {
    setLoading(true)
    try {
      // Note: You'll need to implement this endpoint in your API
      const res = await fetch(url, {
        method: 'DELETE',
        headers: myHeaders,
        body: JSON.stringify({ ids }),
      })
      await res.json()

      // Refresh the current page after deletion
      await fetchAllLinks(
        pagination.currentPage,
        pagination.pageSize,
        searchTerm
      )

      toast.success('Links deleted', {
        icon: '🗑️',
        duration: 2500,
      })
    } catch (error) {
      console.error('Error deleting links:', error)

      toast.error('Error deleting links', {
        icon: '❌',
        duration: 2500,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLinkDelete = async (id) => {
    try {
      setLoading(true)
      const res = await fetch(`${url}/${id}`, {
        method: 'DELETE',
        headers: myHeaders,
      })
      const data = await res.json()

      // Refresh the current page after deletion
      await fetchAllLinks(
        pagination.currentPage,
        pagination.pageSize,
        searchTerm
      )

      console.log(data)
      toast.success('Link deleted', {
        icon: '🗑️',
        duration: 2500,
      })
    } catch (error) {
      console.error('Error deleting link:', error)
      toast.error('Error deleting link', {
        icon: '❌',
        duration: 2500,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <LinksContext.Provider
      value={{
        loading,
        allLinks,
        fetchAllLinks,
        removeMultipleLinksById,
        handleLinkDelete,
        pagination,
        setPagination,
        searchTerm,
        setSearchTerm,
        isInitialized,
      }}
    >
      {children}
    </LinksContext.Provider>
  )
}

// Custom hook to consume the links data and any necessary methods
export const useLinks = () => {
  const context = useContext(LinksContext)

  if (!context) {
    throw new Error('useLinks must be used within a LinksProvider')
  }

  return context
}
