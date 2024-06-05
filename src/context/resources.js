import React, { createContext, useState, useContext } from 'react'

const ResourceContext = createContext()

export const ResourceProvider = ({ children }) => {
  // Define your resource data and any other required state here

  const url = 'https://kruze-ai-agent.vercel.app/api/questions/all';
  // const url = 'http://localhost:3000/api/questions/all';

  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(false)

  const [allQuestions, setAllQuestions] = useState([])

  const fetchAllQuestions = async () => {
    setLoading(true)
    const res = await fetch(url, { next: { revalidate: 43200 } })
    const questions = await res.json()
    // console.log(questions)
    setAllQuestions(questions)
    setLoading(false)
  }

  // Add any other functions or methods needed to modify resource data

  // Provide the resource data and any necessary methods to child components

  return (
    <ResourceContext.Provider value={{ loading, resources, setResources, allQuestions, fetchAllQuestions }}>
      {children}
    </ResourceContext.Provider>
  )
}

// Custom hook to consume the resource data and any necessary methods

export const useResources = () => {
  const context = useContext(ResourceContext)

  if (!context) {
    throw new Error('useResources must be used within a ResourceProvider')
  }

  return context
}
