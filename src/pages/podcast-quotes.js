import React, { useState } from 'react'
import Layout from '@/components/layout'
import toast, { Toaster } from 'react-hot-toast'
import { promptTemplatePodcastQuotes } from '../../utils/handleprompts/internal'

import MessageBubble from '@/components/common/message-bubble'

const sourceFilters = ['website']
const typeFilters = ['podcast']

const PodcastQuotes = () => {
  const [urls, setUrls] = useState('')
  const [processedPages, setProcessedPages] = useState([])

  const [processsingPages, setProcessingPages] = useState(0)

  const handlePageParse = async (pageUrl) => {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: pageUrl }),
      redirect: 'follow',
    }

    try {
      if (!pageUrl) {
        toast.error('Please provide a URL', { duration: 2000 })
        return
      }

      if (!pageUrl.startsWith('http')) {
        toast.error('Please provide a valid URL', { duration: 2000 })
        return
      }

      const response = await fetch('/api/parse', requestOptions)

      if (!response.ok) {
        throw new Error('Failed to parse page')
      }

      const { pageContent, name } = await response.json()

      return { url: pageUrl, name, content: pageContent }
    } catch (error) {
      console.error('Error parsing page:', error)
      toast.error('Error parsing page content')
      return null
    }
  }

  const getEmbedding = async (question) => {
    const questionRequestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: question,
      }),
      redirect: 'follow', // manual, *follow, error
    }

    const { embedding } = await fetch(
      '/api/v1/generateembedding',
      questionRequestOptions
    )
      .then((response) => {
        if (response.status === 200) {
          console.log('post success')
          console.log(response)
          toast('Embedding generated', {
            icon: '🚀',
            duration: 2000,
          })
        }
        return response.json()
      })
      .then((result) => result)
      .catch((error) => {
        console.log('error', error)
        toast('Error generating embedding', {
          icon: '❌',
        })
        return { embedding: '' }
      })

    return embedding
  }

  const getData = async (embedding, sourceFilters, typeFilters) => {
    const questionRequestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embedding: embedding,
        sourceFilters: sourceFilters,
        typeFilters: typeFilters,
        topK: 16,
      }),
      redirect: 'follow', // manual, *follow, error
    }

    const { data } = await fetch(
      '/api/v1/queryembedding',
      questionRequestOptions
    )
      .then((response) => {
        if (response.status === 200) {
          console.log('post success')
          console.log(response)
          toast('Data fetched', {
            icon: '🚀',
            duration: 2000,
          })
        }
        return response.json()
      })
      .then((result) => result)
      .catch((error) => {
        console.log('error', error)
        toast('Error generating completion', {
          icon: '❌',
        })
        return { data: [] }
      })

    console.log('data', data)

    return data
  }

  const getSources = async (data) => {
    const sources = await data.matches.map((match) => {
      return {
        id: match.metadata.id,
        title: match.metadata.title,
        type: match.metadata.type,
        image: match.metadata.image || '',
        source: match.metadata.source,
        url: match.metadata.url,
        score: match.score,
        content: match.metadata.content,
      }
    })

    console.log('sources ', sources.length)

    return sources
  }

  const generateQuote = async (text, sources) => {
    const prompt = promptTemplatePodcastQuotes(text, sources)

    console.log('prompt ', prompt)

    const promptRequestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful startup tax, accounting and bookkeeping assistant.',
          },
          { role: 'user', content: prompt },
        ],
        model: usedModel,
        temperature: 0.1,
      }),
      redirect: 'follow',
    }

    try {
      const response = await fetch(
        '/api/v1/singlecompletion',
        promptRequestOptions
      )

      if (!response.ok) {
        throw new Error('Failed to generate quote')
      }

      const { completion } = await response.json()
      return completion
    } catch (error) {
      console.error('Error generating quote:', error)
      toast.error('Error generating quote')
      return null
    }
  }

  const promptForSummary = `Generate key topics of the article below, no lists, separate with comma:`

  const generateSummary = async (text) => {
    const prompt = `${promptForSummary}\n${text}`

    const promptRequestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful startup tax, accounting and bookkeeping assistant.',
          },
          { role: 'user', content: prompt },
        ],
        model: usedModel,
        temperature: 0.1,
      }),
      redirect: 'follow',
    }

    try {
      const response = await fetch(
        '/api/v1/singlecompletion',
        promptRequestOptions
      )

      if (!response.ok) {
        throw new Error('Failed to generate summary')
      }

      const { completion } = await response.json()
      return completion
    } catch (error) {
      console.error('Error generating summary:', error)
      toast.error('Error generating summary')
      return null
    }
  }

  const handleChange = (e) => {
    setUrls(e.target.value)
  }

  // const handleSubmit = async () => {
  //   const urlsArray = urls.split('\n');

  //   setProcessingPages(urlsArray.length);

  //   urlsArray.forEach(async (url) => {
  //     const pageData = await handlePageParse(url);
  //     if (pageData) {
  //       const summary = await generateSummary(pageData.content);
  //       const embedding = await getEmbedding(summary);
  //       const data = await getData(embedding, sourceFilters, typeFilters);
  //       const sources = await getSources(data);

  //       const quote = await generateQuote(`
  //         Page Url: ${pageData.url},
  //         Page Title: ${pageData.name},
  //         Summary: ${summary}
  //         `, sources);

  //       setProcessedPages(prevPages => [...prevPages, { ...pageData, summary, quote }]);
  //       setProcessingPages(prevPages => prevPages - 1);
  //     }
  //   });
  // };

  const handleSubmit = async () => {
    const urlsArray = urls.split('\n')
    const promises = urlsArray.map(async (url) => {
      const pageData = await handlePageParse(url)
      if (pageData) {
        const summary = await generateSummary(pageData.content)
        const embedding = await getEmbedding(summary)
        const data = await getData(embedding, sourceFilters, typeFilters)
        const sources = await getSources(data)

        const quote = await generateQuote(
          `
          Page Url: ${pageData.url},
          Page Title: ${pageData.name},
          Summary: ${summary}
          `,
          sources
        )
        return { ...pageData, summary, quote }
      }
      return null
    })

    const results = await Promise.all(promises)
    setProcessedPages(results.filter((result) => result !== null))
  }

  return (
    <Layout>
      <h1>Podcast Quotes</h1>
      <p>Processing Pages: {processsingPages}</p>
      <textarea
        value={urls}
        onChange={handleChange}
        placeholder="Enter URLs separated by new line"
        rows="4"
        cols="50"
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Submit
      </button>

      <table>
        <thead>
          <tr>
            <th>URL</th>
            <th>Name</th>
            <th>Content</th>
            <th>Summary</th>
            <th className="w-[640px]">Quote</th>
          </tr>
        </thead>
        <tbody>
          {processedPages.map((page, idx) => (
            <tr key={page.url} className={idx % 2 === 0 ? 'bg-white' : ''}>
              <td>{page.url}</td>
              <td>{page.name}</td>
              <td>{page.content.slice(0, 1000)}...</td>
              <td>{page.summary}</td>
              <td>
                <MessageBubble message={page.quote} role="assistant" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Toaster />
    </Layout>
  )
}

export default PodcastQuotes
