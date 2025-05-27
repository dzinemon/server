import { Tab } from '@headlessui/react'
import { useEffect, useState } from 'react'
import { parseUrls } from '../../utils/links'
import { removeAllUrls, removeUrl, fetchUrls, addUrls } from '../../utils/api'

import {
  ArrowPathIcon,
  CheckIcon,
  LinkIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid'

import DataTable from './common/DataTable'
import toast from 'react-hot-toast'

import Loading from './Loading'

// http://localhost:3000/api/urls/:id
function LinksList() {
  // name, url, id, uuids
  const [data, setData] = useState(null)

  const [isLoading, setLoading] = useState(true)

  const [isToDelete, setIsToDelete] = useState(false)

  const url = '/api/urls'

  const myHeaders = new Headers()
  myHeaders.append('Content-Type', 'application/json')

  const delRequsetOptions = {
    method: 'DELETE',
    redirect: 'follow',
  }

  const initialFormState = {
    url: '',
    urls: '',
    internal: false,
  }

  const [formState, setFormState] = useState(initialFormState)

  const handleRemoveAll = async () => {
    try {
      await removeAllUrls()
      setData([])
    } catch (error) {
      console.log('error', error)
    }
  }

  const handleSubmitMultiple = async (e) => {
    e.preventDefault()
    const urls = parseUrls(formState.urls)
    if (!urls.length) return
    await addUrls(urls, formState.internal)
    setFormState(initialFormState)
    // Refresh the data
    fetchUrls()
      .then((data) => setData(data))
      .catch((error) => console.log(error))
  }

  const handleRemove = async (id) => {
    // remove the item by id
    const item = data.find((item) => item.id === id)
    if (!item) return

    try {
      await removeUrl(item.id, item.uuids)
      // Refresh the data after removing
      const updatedData = await fetchUrls()
      setData(updatedData)

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

      // Refresh the data after reuploading
      const updatedData = await fetchUrls()
      setData(updatedData)

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

  // Define actions for DataTable
  const actions = [
    {
      key: 'remove',
      icon: TrashIcon,
      iconClassName: 'w-4 h-4 text-red-600 cursor-pointer',
      title: 'Remove Item',
      handler: handleRemove,
      showInBulk: true,
      className: 'ml-2',
    },
    {
      key: 'reupload',
      icon: ArrowPathIcon,
      iconClassName: 'w-4 h-4 text-blue-600 cursor-pointer',
      title: 'Reupload Item',
      handler: handleReUpload,
      showInBulk: true,
      className: 'ml-2',
    },
  ]

  useEffect(() => {
    fetchUrls()
      .then((data) => {
        setData(data)
        setLoading(false)
      })
      .catch((error) => {
        console.log(error)
        setLoading(false)
      })
  }, [])

  if (isLoading) return <Loading />

  if (!data) return <p>No data</p>

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
                className="block w-full rounded-md border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-kruze-blueDark sm:text-sm sm:leading-6"
                placeholder="Enter URLs separated by line breaks, commas, or spaces:&#10;https://example.com&#10;https://another-site.com, https://third-site.com"
                rows={5}
              />
            </div>
            <div className="space-y-2">
              {/* URL format information */}
              <div className="text-sm text-gray-500 flex items-start space-x-2">
                <span className="text-kruze-blue">ℹ️</span>
                <span>
                  You can enter URLs in any of these formats:
                  <ul className="list-disc ml-5 mt-1">
                    <li>One URL per line (recommended)</li>
                    <li>Comma-separated URLs</li>
                    <li>Space-separated URLs</li>
                  </ul>
                </span>
              </div>

              {/* Checkbox to add internal and external source */}
              <div className="flex flex-col pt-2">
                <div className="flex items-center">
                  <input
                    id="internal"
                    name="internal"
                    type="checkbox"
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        internal: e.target.checked,
                      })
                    }
                    checked={formState.internal}
                    className="h-4 w-4 text-kruze-blueDark focus:ring-kruze-blue border-gray-300 rounded"
                  />
                  <label
                    htmlFor="internal"
                    className="ml-2 block text-sm font-medium text-gray-900"
                  >
                    For Internal usage
                  </label>
                </div>
                {formState.internal && (
                  <p className="ml-6 mt-1 text-xs text-gray-500 italic">
                    These submitted resources/URLs will be used for
                    answering questions on Internal Chat only
                  </p>
                )}
              </div>
            </div>
            <button
              type="submit"
              className="flex w-auto flex-grow whitespace-nowrap rounded-md bg-kruze-blueDark px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-kruze-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kruze-blueDark"
            >
              Submit URLs
            </button>
          </div>
        </form>
      </div>
      <div className="mt-6">
        {data && data.length === 0 ? (
          <p className="italic opacity-60 text-center">No uploaded URLs</p>
        ) : (
          <DataTable items={data} actions={actions} />
        )}
      </div>
    </div>
  )
}

export default LinksList
