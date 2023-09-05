import { useState, useEffect } from 'react'
import axios from 'axios'
import LinkListItem from './link-list-item'
import Loading from './Loading'

import {
  DocumentTextIcon,
  FolderArrowDownIcon,
} from '@heroicons/react/24/solid'

// http://localhost:3000/api/urls/:id
function FileUploadComponent() {
  const url = '/api/upload-pdf'
  const [data, setData] = useState(null)
  const [isLoading, setLoading] = useState(true)

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
    // Other form fields can also be appended to the formData
    // formData.append('name', name);
    // formData.append('description', description);

    try {
      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      console.log(response.data)
      // Handle success or display a success message
    } catch (error) {
      console.error(error)
      // Handle error or display an error message
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
      <div className="bg-white border-2 border-red-500">
        <form onSubmit={handleSubmit}>
          <input type="file" onChange={handleFileChange} />
          {/* Other form fields can also be added */}
          {/* <input type="text" value={name} onChange={(e) => setName(e.target.value)} /> */}
          {/* <textarea value={description} onChange={(e) => setDescription(e.target.value)} /> */}
          <button type="submit">Submit</button>
        </form>
      </div>

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
                      <FolderArrowDownIcon className="text-gray-600 w-4 h-4 inline" />
                      Plain Text
                    </label>
                    <input
                      className="block w-full text-sm text-slate-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-100 file:text-indigo-700
                      hover:file:bg-indigo-200"
                      type="file"
                      name="pdf"
                      accept=".pdf"
                    />
                  </div>

                  <button
                    type="submit"
                    className="flex w-auto text-n flex-grow whitespace-nowrap rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Submit File for Processing
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
    </div>
  )
}

export default FileUploadComponent
