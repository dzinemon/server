'use client'

import { useState, useEffect } from 'react'
// import LinkInput from './link-input'
import LinkListItem from './link-list-item'

import { LinkIcon } from '@heroicons/react/24/solid'

import Loading from './Loading'

// http://localhost:3000/api/urls/:id
function Measure() {
  const [data, setData] = useState(null)
  // const [isLoading, setLoading] = useState(true)

  const url = '/api/urls'

  const myHeaders = new Headers()
  myHeaders.append('Content-Type', 'application/json')

  const delRequsetOptions = {
    method: 'DELETE',
    redirect: 'follow',
  }

  const initialFormState = {
    urls: '',
  }

  const [formState, setFormState] = useState(initialFormState)

  const [totalTokens, setTokensCount] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const postRequestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        urls: formState.urls,
      }),
      redirect: 'follow', // manual, *follow, error
    }

    const res = await fetch('/api/token-counter', postRequestOptions)
      .then((response) => {
        if (response.status === 200) {
          console.log('post success')
          console.log(response)
        }
        return response.json()
      })
      .then((result) => {
        setData((prev) => {
          if (prev) {
            return [...prev, ...result]
          }
          return result
        })
      })
      .catch((error) => console.log('error', error))

    console.log(res)
    setFormState(initialFormState)
  }

  useEffect(() => {
    const totalNewTokens = data?.reduce((acc, item) => {
      return acc + item.tokensCount
    }, 0)

    setTokensCount((prevState) => {
      if (prevState) {
        return prevState + totalNewTokens
      }

      return totalNewTokens
    })
  }, [data])

  // if (isLoading) return <Loading />
  // if (!data) return <p>No data</p>

  return (
    <div className="container max-w-2xl py-12">
      <form onSubmit={handleSubmit}>
        <div className="space-y-12">
          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Submit url to measure tokens
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Upload Multiple urls
            </p>
            <div className="mt-10">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="link-url"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    <LinkIcon className="text-gray-600 w-4 h-4 inline" /> Urls{' '}
                    <span className="opacity-60 italic text-xs">
                      Comma-separated or space sepparated{' '}
                    </span>
                  </label>
                  <textarea
                    onChange={(event) => handleChange(event)}
                    name="urls"
                    value={formState?.urls}
                    className="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    rows="3"
                    placeholder="Enter urls here"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="flex w-auto text-n flex-grow whitespace-nowrap rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Submit URL
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      <div>
        <h2>Urls</h2>
        <table className="table-auto">
          <tbody>
            <tr>
              <td className="border px-4 py-2">Total urls</td>
              <td className="border px-4 py-2">{data && data.length}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div>
        <h2>Data</h2>

        <table className="table-auto">
          <thead>
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Tokens</th>
            </tr>
          </thead>
          <tbody>
            {data &&
              data?.map((item, idx) => {
                return (
                  <tr key={idx}>
                    <td className="border px-4 py-2">
                      <a
                        href={item.pageUrl}
                        className="underline italic hover:no-underline hover:opacity-70"
                      >
                        {item.name}
                      </a>
                    </td>
                    <td className="border px-4 py-2">{item.tokensCount}</td>
                  </tr>
                )
              })}

            <tr>
              <td className="border px-4 py-2">Total</td>
              <td className="border px-4 py-2">{totalTokens}</td>
            </tr>

            <tr>
              <td className="border px-4 py-2">Total urls</td>
              <td className="border px-4 py-2">{data && data.length}</td>
            </tr>

            <tr>
              <td className="border px-4 py-2">
                Embeddings creation (Ada v2 $0.0001 / 1K tokens)
              </td>
              <td className="border px-4 py-2">
                {totalTokens && (totalTokens * 0.0001) / 1000} $
              </td>
            </tr>

            <tr>
              <td className="border px-4 py-2">
                Completion creation GPT4 (8K context $0.03 / 1K tokens $0.06 /
                1K tokens)
              </td>
              <td className="border px-4 py-2">
                {totalTokens && (totalTokens * 0.06) / 1000} $
              </td>
            </tr>

            <tr>
              <td className="border px-4 py-2">
                Completion creation GPT3.5TURBO (4K context $0.0015 / 1K tokens
                $0.002 / 1K tokens)
              </td>
              <td className="border px-4 py-2">
                {totalTokens && (totalTokens * 0.002) / 1000} $
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Measure
