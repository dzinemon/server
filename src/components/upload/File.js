import Papa from 'papaparse'
import { useEffect, useState } from 'react'
import Loading from '../Loading'
import DataTable from '../common/DataTable'
import { TrashIcon } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'

import { sourceFilters, typeFilters } from '../../../utils/hardcoded'

const Upload = () => {
  const [data, setData] = useState(null)
  const [isLoading, setLoading] = useState(true)

  const [csvData, setCsvData] = useState([])
  const [currentSource, setCurrentSource] = useState('slack')

  const [currentType, setCurrentType] = useState('slack')

  const url = '/api/upload-csv'
  const myHeaders = new Headers()
  myHeaders.append('Content-Type', 'application/json')

  const delRequsetOptions = {
    method: 'DELETE',
    redirect: 'follow',
  }

  const handleRemove = async (id) => {
    // Find the item to get its uuids
    const item = data.find((item) => item.id === id)
    if (!item) return

    try {
      const res = await fetch(
        `/api/upload-csv/${id}?ids=${JSON.stringify(item.uuids)}`,
        delRequsetOptions
      )

      if (res.status === 200) {
        console.log(`deleted item with id ${id} successfully`)
        const newData = data.filter((item) => item.id !== id)
        setData(newData)

        toast.success(`Removed item ${item.name} successfully!`, {
          duration: 2000,
          icon: '✅',
        })
      } else {
        throw new Error(`Failed to delete item: ${res.status}`)
      }
    } catch (error) {
      console.error('Error removing item:', error)
      toast.error(`Failed to remove item ${item.name}`, {
        duration: 2000,
        icon: '❌',
      })
    }
  }

  // Define actions for DataTable (CSV files only need remove action)
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
  ]

  const handleFileChange = (e) => {
    const file = e.target.files[0]

    // check if file exists
    if (!file) {
      return
    }

    Papa.parse(file, {
      complete: (results) => {
        console.log('Parsed results: ', results)
        setCsvData(results.data)
      },
      header: true,
    })
  }

  const handleCSVDataSubmit = async (e) => {
    e.preventDefault()
    console.log('CSV Data to be Uploaded: ', csvData.length)

    const csvFilePromises = csvData.map(
      (file, index) =>
        new Promise((resolve) =>
          setTimeout(async () => {
            const postRequestOptions = {
              method: 'POST',
              headers: myHeaders,
              body: JSON.stringify({
                url: file.url,
                multiple: false,
                source: currentSource,
                title: file.title,
                text: file.text,
                image:
                  'https://kruzeconsulting.com/img/kruze-logos/kruze-transparent-black.png',
                type: currentType,
              }),
              redirect: 'follow', // manual, *follow, error
            }

            try {
              const response = await fetch(
                '/api/upload-csv',
                postRequestOptions
              )
              if (response.status === 200) {
                console.log('post success')
                console.log(response)
              }
              const result = await response.text()
              console.log(result)
              resolve(result)
            } catch (error) {
              console.log('error', error)
              resolve(null)
            }
          }, 1000 * index)
        )
    )

    const results = await Promise.all(csvFilePromises)
    console.log('Results: ', results)
    setCsvData([])
  }

  useEffect(() => {
    // make it try catch

    try {
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          setData(data)
        })
        .then(() => setLoading(false))
        .catch((error) => {
          console.log(error)
          setLoading(false)
        })
    } catch (error) {
      console.log(error)
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="p-4 bg-slate-200 rounded-lg ">
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-3 bg-white p-3 rounded-xl">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Upload a CSV
            </h2>
            <p className="text-sm text-gray-500">
              file with the following columns: <strong>url</strong>,{' '}
              <strong>title</strong>, <strong>text</strong>
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-kruze-blueLight file:text-kruze-blueDark
              hover:file:bg-blue-100"
            />
          </div>
          <label className="bg-slate-100 rounded-md p-3 block">
            <span className="w-full block">
              Selected Filter: {currentSource}
            </span>
            <select
              className="block w-full rounded-md border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-kruze-blueDark sm:text-sm sm:leading-6"
              name="filter"
              id="filter"
              value={currentSource}
              onChange={(e) => setCurrentSource(e.target.value)}
            >
              {sourceFilters.map((filter, idx) => (
                <option key={`type-filter-${filter}-${idx}`} value={filter}>
                  {filter}
                </option>
              ))}
            </select>
          </label>
          <label className="bg-slate-100 rounded-md p-3 block">
            <span>Selected Type: {currentType}</span>
            <select
              className="block w-full rounded-md border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-kruze-blueDark sm:text-sm sm:leading-6"
              name="type"
              id="type"
              value={currentType}
              onChange={(e) => setCurrentType(e.target.value)}
            >
              {typeFilters.map((filter, idx) => (
                <option key={`type-filter-${filter}-${idx}`} value={filter}>
                  {filter}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {csvData.length > 0 && (
        <div>
          <button
            disabled={csvData.length === 0 || !currentSource || !currentType}
            className="rounded-md bg-kruze-blueDark px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-kruze-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kruze-blueDark disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleCSVDataSubmit}
          >
            Submit {csvData.length} Items
          </button>
        </div>
      )}

      {/* Output parsed CSV data */}
      {csvData.length > 0 ? (
        <ul className="list-disc space-y-2 text-xs list-inside">
          {csvData.map((item, i) => (
            <li key={i}>
              {item.title && <span className="text-sm">{item.title}</span>}
              {item.url && (
                <a href={item.url} className="text-blue-500">
                  {item.url}
                </a>
              )}
            </li>
          ))}
        </ul>
      ) : null}

      {/* <hr /> */}

      {isLoading && <Loading />}

      {data && data.length === 0 ? (
        <p className="italic opacity-60 text-center">No Uploaded items</p>
      ) : (
        <DataTable items={data} actions={actions} />
      )}
    </div>
  )
}

export default Upload
