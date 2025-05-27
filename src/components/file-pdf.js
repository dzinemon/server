import axios from 'axios'
import { useEffect, useState } from 'react'
import LinkListItem from './link-list-item'
import Loading from './Loading'

import {
  DocumentTextIcon,
  FolderArrowDownIcon
} from '@heroicons/react/24/solid'

function PdfFileUploadComponent() {
  const url = '/api/upload-pdf'
  const [data, setData] = useState(null)
  const [isLoading, setLoading] = useState(true)
  const [isToDelete, setIsToDelete] = useState(false)

  const [file, setFile] = useState(null)

  // Other form fields can also be stored in state using useState
  // const [name, setName] = useState('');
  // const [description, setDescription] = useState('');

  const handleFileChange = (event) => {
    setFile(event.target.files[0])
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', formState.name)

    try {
      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      console.log(response.data)
      // Reset form after successful submission
      setFormState(initialFormState)
      setFile(null)

      // Refresh the data list
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          setData(data)
        })
        .catch((error) => {
          console.log(error)
        })
    } catch (error) {
      console.error('Error uploading file:', error)
    }
  }

  // const myHeaders = new Headers();
  //   myHeaders.append("Content-Type", "application/json");

  const initialFormState = {
    name: '',
    text: '',
    file: null,
  }

  const [formState, setFormState] = useState(initialFormState)

  const handleRemove = async (id, ids) => {
    try {
      const delRequestOptions = {
        method: 'DELETE',
        redirect: 'follow',
      }

      const response = await fetch(
        `/api/upload-pdf/${id}?ids=${JSON.stringify(ids)}`,
        delRequestOptions
      )

      if (response.status === 200) {
        console.log(`deleted item with id ${id} successfully`)
        const newData = data.filter((item) => item.id !== id)
        setData(newData)
      }

      const result = await response.text()
      console.log(result)
    } catch (error) {
      console.log('error', error)
    }
  }

  const handleRemoveAll = async () => {
    try {
      const delRequestOptions = {
        method: 'DELETE',
        redirect: 'follow',
      }

      const response = await fetch('/api/upload-pdf', delRequestOptions)

      if (response.status === 200) {
        console.log('deleted all items successfully')
        setData([])
      }

      const result = await response.text()
      console.log(result)
    } catch (error) {
      console.log('error', error)
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
      <div className={'bg-slate-300 px-4'}>
        <form onSubmit={handleSubmit}>
          <div className="space-y-12">
            <div className="border-b border-gray-900/10 pb-12">
              <h2 className="text-base font-semibold leading-7 text-gray-900">
                Add PDF file to Knowledge base
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                One file per upload
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
                        htmlFor="file-upload"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        <FolderArrowDownIcon className="text-gray-600 w-4 h-4 inline" />{' '}
                        Select PDF File
                      </label>
                      <input
                        id="file-upload"
                        onChange={(e) => {
                          handleFileChange(e)
                          setFormState({
                            ...formState,
                            file: e.target.files[0],
                          })
                        }}
                        className="block w-full text-sm text-slate-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-kruze-blueLight file:text-kruze-blueDark
                            hover:file:bg-blue-100"
                        type="file"
                        name="pdf"
                        accept=".pdf"
                      />
                      {file && (
                        <p className="mt-1 text-xs text-gray-500">
                          Selected file: {file.name}
                        </p>
                      )}
                    </div>{' '}
                    <button
                      type="submit"
                      className="flex w-auto flex-grow whitespace-nowrap rounded-md bg-kruze-blueDark px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-kruze-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kruze-blueDark"
                    >
                      Submit File for Processing
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
      <div className="mt-6">
        {data && data.length === 0 ? (
          <p className="italic opacity-60 text-center">No uploaded files</p>
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

export default PdfFileUploadComponent
