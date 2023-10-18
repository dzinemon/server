import { useState, useEffect } from 'react'
// import LinkInput from './link-input'
import QuestionListItem from './question-list-item'

import { QuestionMarkCircleIcon } from '@heroicons/react/24/solid'

import Loading from './Loading'

// http://localhost:3000/api/questions/:id
function QuestionsList() {
  const [data, setData] = useState(null)
  const [isLoading, setLoading] = useState(true)

  const url = '/api/questions'

  const myHeaders = new Headers()
  myHeaders.append('Content-Type', 'application/json')

  const delRequsetOptions = {
    method: 'DELETE',
    redirect: 'follow',
  }

  const handleRemove = async (id) => {
    const res = await fetch(`/api/questions/${id}`, delRequsetOptions)
      .then((response) => {
        if (response.status === 200) {
          console.log(`deleted item with id ${id} successfully`)
          const newData = data.filter((link) => link.id !== id)
          setData(newData)
        }
        return response.text()
      })
      .then((result) => {
        console.log(result)
      })
      .catch((error) => console.log('error', error))
    console.log(res)
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
    } catch (error) {
      console.log(error)
    }
  }, [data])

  if (isLoading) return <Loading />
  if (!data) return <p>No data</p>

  return (
    <div className="container max-w-7xl py-12">
      <div>
        {data && data.length === 0 ? (
          <p className="italic opacity-60 text-center">No questions yet.</p>
        ) : null}
      </div>

      <div>
        {data.map((link) => (
          <QuestionListItem
            key={link.id}
            question={link}
            onClick={() => handleRemove(link.id)}
          />
        ))}
      </div>

      <ul>{/* {JSON.stringify(data)} */}</ul>
    </div>
  )
}

export default QuestionsList
