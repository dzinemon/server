import React, { createContext, useState, useContext, useEffect } from 'react'
import TurndownService from 'turndown';
import { baseUrl } from '../../utils/config'


const ResourceContext = createContext()

export const ResourceProvider = ({ children }) => {
  // Define your resource data and any other required state here
  const url = `${baseUrl}/api/questions/all`

  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(false)

  const [text, setText] = useState('');

  const [markdownContent, setMarkdownContent] = useState('');

  const handleTextChange = (text) => {
    setText(text)
  }

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

  useEffect(() => {
    setMarkdownContent(text)
    // if (text) {
      // const turndownService = new TurndownService({
      //   headingStyle: 'atx',
      //   bulletListMarker: '*',
      //   codeBlockStyle: 'fenced',
      //   emDelimiter: '*',
      //   strongDelimiter: '**',
      //   linkStyle: 'inlined',
      //   linkReferenceStyle: 'full',
      //   br: '  ',
      //   hr: '---',
      //   blockquote: '> ',
      //   fence: '```',

      // })
      // const markdown = turndownService.turndown(text)
      // setMarkdownContent(text)
    // }
  }, [text])

  

  return (
    <ResourceContext.Provider value={{ loading, resources, setResources, allQuestions, fetchAllQuestions, text, handleTextChange, 
      markdownContent
     }}>
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
