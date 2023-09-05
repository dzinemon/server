import { useState, useEffect } from 'react'
// import LinkInput from './link-input'
import LinkListItem from './link-list-item'
import Loading from './Loading'

import {
  PhotoIcon,
  DocumentTextIcon,
  LinkIcon,
} from '@heroicons/react/24/solid'

// http://localhost:3000/api/urls/:id
function TextsList() {
  const [data, setData] = useState(null)
  const [isLoading, setLoading] = useState(true)

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
      `http://localhost:3000/api/texts/${id}?ids=${JSON.stringify(ids)}`,
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

  const handleSubmit = async (e) => {
    e.preventDefault()

    const postRequestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        name: formState.name,
        text: formState.text,
      }),
      redirect: 'follow',
    }

    const res = await fetch('/api/texts', postRequestOptions)
      .then((response) => {
        if (response.status === 200) {
          console.log('post success')
          console.log(response)
          // const newData = data.
          // setData(newData)
        }
        return response.text()
      })
      .then((result) => console.log(result))
      .catch((error) => console.log('error', error))

    console.log(res)

    // reflect the change in the UI
    setFormState(initialFormState)
    // reload the page
    // window.location.reload()
  }

  useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setData(data)
        setLoading(false)
      })
  }, [data])

  if (isLoading) return <Loading />
  if (!data) return <p>No data</p>

  return (
    <div className="container max-w-2xl py-12">
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
                        setFormState({ ...formState, name: e.target.value })
                      }
                      value={formState.name}
                      type="text"
                      name="text-name"
                      id="text-name"
                      autoComplete="given-name"
                      className="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="text"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      <DocumentTextIcon className="text-gray-600 w-4 h-4 inline" />
                      Plain Text
                    </label>
                    <textarea
                      onChange={(e) =>
                        setFormState({ ...formState, text: e.target.value })
                      }
                      rows={10}
                      id="text"
                      value={formState.text}
                      className="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    ></textarea>
                    <div>{formState.text.length}</div>
                  </div>

                  <button
                    type="submit"
                    className="flex w-auto text-n flex-grow whitespace-nowrap rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Submit Text
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      <div>
        {data && data.length === 0 ? (
          <p className="italic opacity-60 text-center">
            Please create new item
          </p>
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

      <ul>{/* {JSON.stringify(data)} */}</ul>
    </div>
  )
}

export default TextsList
