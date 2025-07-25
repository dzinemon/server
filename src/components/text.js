import { useState, useEffect } from 'react'
import { Tab } from '@headlessui/react'
import LinkListItem from './link-list-item'
import Loading from './Loading'

import {
  DocumentTextIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid'

function TextsList() {
  const [data, setData] = useState(null)
  const [isLoading, setLoading] = useState(true)
  const [isToDelete, setIsToDelete] = useState(false)

  const url = '/api/texts'

  const myHeaders = new Headers()
  myHeaders.append('Content-Type', 'application/json')

  const delRequsetOptions = {
    method: 'DELETE',
    redirect: 'follow',
  }

  const initialFormState = {
    name: '',
    text: '',
  }

  const [formState, setFormState] = useState(initialFormState)

  const handleRemove = async (id, ids) => {
    const res = await fetch(
      `/api/texts/${id}?ids=${JSON.stringify(ids)}`,
      delRequsetOptions
    )
      .then((response) => {
        if (response.status === 200) {
          console.log(`deleted item with id ${id} successfully`)
          const newData = data.filter((link) => link.id !== id)
          setData(newData)
        }
        return response.text()
      })
      .then((result) => console.log(result))
      .catch((error) => console.log('error', error))
    console.log(res)
  }

  const handleRemoveAll = async () => {
    const res = await fetch(`/api/texts`, delRequsetOptions)
      .then((response) => {
        if (response.status === 200) {
          console.log(`deleted all items successfully`)
          setData([])
        }
        return response.text()
      })
      .then((result) => {
        console.log(result)
      })
      .catch((error) => console.log('error', error))
    console.log(res)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const postRequestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify({
          name: formState.name,
          text: formState.text,
        }),
        redirect: 'follow',
      }

      const response = await fetch('/api/texts', postRequestOptions)
      if (response.status === 200) {
        console.log('Text added successfully')

        // Reset form state
        setFormState(initialFormState)

        // Refresh the data
        fetch(url)
          .then((res) => res.json())
          .then((data) => {
            setData(data)
          })
          .catch((error) => {
            console.log(error)
          })
      } else {
        console.log('Failed to add text:', response.status)
      }
    } catch (error) {
      console.log('Error adding text:', error)
    }
  }

  useEffect(() => {
    try {
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          console.log(data)
          setData(data)
          setLoading(false)
        })
        .catch((error) => {
          console.log(error)
          setLoading(false)
        })
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }, [])

  if (isLoading) return <Loading />
  if (!data) return <p>No data</p>

  return (
    <div className="py-12">
      <Tab.Group>
        <Tab.List>
          <Tab className={'bg-slate-200 px-4 py-1.5 rounded-t-md'}>
            Add Text
          </Tab>
          <Tab className={'bg-red-300 px-4 py-1.5 rounded-t-md'} disabled>
            Remove All
          </Tab>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel className={'bg-slate-200 px-4'}>
            <form onSubmit={handleSubmit}>
              <div className="space-y-12">
                <div className="border-b border-gray-900/10 pb-12">
                  <h2 className="text-base font-semibold leading-7 text-gray-900">
                    Add plain text to Knowledge base
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    One text item per upload
                  </p>
                  <div className="mt-10">
                    <div className="">
                      <div className="mt-2 space-y-4">
                        <div>
                          <label
                            htmlFor="text-name"
                            className="block text-sm font-medium leading-6 text-gray-900"
                          >
                            <DocumentTextIcon className="text-gray-600 w-4 h-4 inline" />{' '}
                            Item Name
                          </label>
                          <input
                            onChange={(e) =>
                              setFormState({
                                ...formState,
                                name: e.target.value,
                              })
                            }
                            value={formState.name}
                            type="text"
                            name="text-name"
                            id="text-name"
                            autoComplete="given-name"
                            className="block w-full rounded-md border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-kruze-blueDark sm:text-sm sm:leading-6"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="text"
                            className="block text-sm font-medium leading-6 text-gray-900"
                          >
                            <DocumentTextIcon className="text-gray-600 w-4 h-4 inline" />{' '}
                            Plain Text
                          </label>
                          <textarea
                            onChange={(e) =>
                              setFormState({
                                ...formState,
                                text: e.target.value,
                              })
                            }
                            rows={10}
                            id="text"
                            value={formState.text}
                            className="block w-full rounded-md border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-kruze-blueDark sm:text-sm sm:leading-6"
                          ></textarea>
                          <div className="text-xs text-gray-500 text-right mt-1">
                            {formState.text.length} characters
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="flex w-auto flex-grow whitespace-nowrap rounded-md bg-kruze-blueDark px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-kruze-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kruze-blueDark"
                        >
                          Submit Text
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </Tab.Panel>
          <Tab.Panel className={'bg-red-300 px-4'}>
            <div className="relative">
              <div className="flex justify-end px-2 lg:px-4 flex-none rounded-lg shrink w-auto">
                {!isToDelete && (
                  <button
                    type="button"
                    onClick={() => setIsToDelete(true)}
                    className="rounded-md bg-kruze-blueDark px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-kruze-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kruze-blueDark"
                  >
                    Remove All{' '}
                    <TrashIcon className="w-4 h-4 text-white inline-block" />
                  </button>
                )}
              </div>

              {isToDelete && (
                <div className="flex items-center justify-center backdrop-blur-sm bg-gray-100/40">
                  <button
                    className="rounded-md bg-kruze-blueDark px-3 py-1 mx-1 text-sm font-semibold text-white shadow-sm hover:bg-kruze-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kruze-blueDark flex items-center"
                    type="button"
                    onClick={handleRemoveAll}
                  >
                    <CheckIcon className="w-4 h-4 inline-block mr-1 text-white" />
                    Confirm
                  </button>
                  <button
                    className="rounded-md bg-gray-500 px-3 py-1 mx-1 text-sm font-semibold text-white shadow-sm hover:bg-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500 flex items-center"
                    type="button"
                    onClick={() => setIsToDelete(false)}
                  >
                    <XMarkIcon className="w-4 h-4 inline-block mr-1 text-white" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      <div className="mt-6">
        {data && data.length === 0 ? (
          <p className="italic opacity-60 text-center">No uploaded items</p>
        ) : null}
      </div>
      <div>
        {data &&
          data.map((link) => (
            <LinkListItem
              key={link.id}
              link={link}
              onClick={() => handleRemove(link.id, link.uuids)}
            />
          ))}
      </div>
    </div>
  )
}

export default TextsList
