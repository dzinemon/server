import { LoadingLine } from '@/components/common/chatloadingstate'
import Counter from '@/components/common/counter'
import Layout from '@/components/layout'
import { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { parsePodcastWithCheerio } from '../../utils/cheerio-axios'
import { promptTemplatePodcastQuotesV2 } from '../../utils/handleprompts/internal'
import { usedModel } from '../../utils/hardcoded'

import MessageBubble from '@/components/common/message-bubble'

const sourceFilters = ['website']
const typeFilters = ['podcast']

const PodcastQuotes = () => {
  const [urls, setUrls] = useState('')
  const [loading, setLoading] = useState(false)
  const [processedPages, setProcessedPages] = useState([])

  const [processsingPages, setProcessingPages] = useState(0)

  const [topK, setTopK] = useState(8)

  // const handlePageParsePodcastUrl = async (pageUrl) => {
  //   const requestOptions = {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({ url: pageUrl }),
  //     redirect: 'follow',
  //   }

  //   try {
  //     if (!pageUrl) {
  //       toast.error('Please provide a URL', { duration: 2000 })
  //       return
  //     }

  //     if (!pageUrl.startsWith('http')) {
  //       toast.error('Please provide a valid URL', { duration: 2000 })
  //       return
  //     }

  //     const response = await fetch('/api/parse/podcast', requestOptions)

  //     if (!response.ok) {
  //       throw new Error('Failed to parse podcast page')
  //     }

  //     const { pageContent, name, title } = await response.json()

  //     const data = { url: pageUrl, name, content: pageContent }
  //     console.log('✅pageContent ready✅', data)

  //     return data
  //   } catch (error) {
  //     console.error('Error parsing page:', error)
  //     toast.error('Error parsing page content')
  //     return null
  //   }
  // }

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

      const { pageContent, name, title } = await response.json()

      const data = { url: pageUrl, name, content: pageContent }
      console.log('✅pageContent ready✅', data)

      return data
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

    console.log('✅embedding ready✅', embedding)

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
        topK: topK,
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

    console.log('✅ data ready✅', data)

    return data
  }

  const getSources = async (data) => {
    const sources = await data.matches
      .map((match) => {
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
      .filter(
        (source, index, self) =>
          index === self.findIndex((t) => t.url === source.url)
      )

    console.log('✅sources ready', sources.length)

    toast(`${sources.length} Sources used`, {
      icon: '✅🚀✅',
      duration: 5000,
    })

    return sources
  }

  const generateQuote = async (pageData, source) => {
    const prompt = promptTemplatePodcastQuotesV2(pageData, source)

    // console.log('prompt ', prompt)

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

      console.log('✅quote ready✅', completion)
      toast('Quote generated', {
        icon: '🚀',
        duration: 2000,
      })

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
      console.log('✅summary ready✅', completion)
      toast('Summary generated', {
        icon: '🚀',
        duration: 2000,
      })
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
    setLoading(true)
    const urlsArray = urls.split('\n')
    const promises = urlsArray
      .filter((url) => url.trim().length > 0)
      .map(async (url) => {
        const pageData = await handlePageParse(url)
        if (pageData) {
          const summary = await generateSummary(pageData.content)
          const embedding = await getEmbedding(summary)
          const data = await getData(embedding, sourceFilters, typeFilters)
          const sources = await getSources(data)

          // for each source in sources get source url and parse the url to get the content

          const sourcesWithContent = await Promise.all(
            sources.map(async (source) => {
              const pageData = await parsePodcastWithCheerio(source.url)
              return {
                url: source.url,
                name: pageData.name,
                content: pageData.pageContent,
              }
            })
          )

          // for each source in sourcesWithContent generate a quote

          const quotes = await Promise.all(
            sourcesWithContent.map(async (source) => {
              const quote = await generateQuote(summary, source)
              return quote
            })
          )

          return { ...pageData, summary, quotes }
        }
        return null
      })

    const results = await Promise.all(promises)
    setLoading(false)
    setProcessedPages(results.filter((result) => result !== null))
  }

  return (
    <Layout>
      <div className="border-b border-gray-900/10 pb-12 container">
        <div className="flex">
          <div className="grow">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Podcast Quotes Tool
            </h2>
          </div>
          <div>Processing Pages: {processsingPages}</div>
        </div>
        <p className="mt-1 text-sm leading-6 text-gray-600">
          Enter the URLs of pages you want to generate quotes for.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="sm:col-span-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Top K
            </label>
            <div className="mt-2">
              <input
                type="number"
                value={topK}
                onChange={(e) => setTopK(e.target.value)}
                max={20}
                className="block pl-4 pr-2 w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                min={1}
              />
            </div>
          </div>

          <div className="col-span-full">
            <label
              htmlFor="about"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Urls
            </label>
            <div className="mt-2">
              <textarea
                value={urls}
                onChange={handleChange}
                placeholder="Enter URLs separated by new line"
                rows="4"
                cols="50"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              ></textarea>
            </div>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              can submit multiple urls, large number of urls may take longer to
              process.
            </p>
          </div>

          <div className="col-span-full">
            <div className="mt-2 flex items-center gap-x-3">
              <button
                type="button"
                onClick={handleSubmit}
                className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
        {loading && (
          <div className="flex items-center space-x-1">
            <div className="text-sm text-slate-500">Elapsed Time:</div>
            <div className="w-10">
              <Counter />s
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="w-full">
          <LoadingLine />
        </div>
      ) : (
        <div className="border-t border-blue-600 w-full" />
      )}

      <div className="space-y-6">
        {processedPages.map((page, idx) => (
          <div key={page.url} className="mb-8">
            <div className="sticky top-16 p-4 shadow-md bg-blue-100">
              <h2 className="text-xl font-bold">{page.name}</h2>
              <p className="text-sm text-gray-500">{page.url}</p>
            </div>
            <div className="p-4 divide-y divide-y-4 space-y-4">
              <MessageBubble
                message={page.quotes.join('\n\n')}
                role="assistant"
              />
            </div>
          </div>
        ))}
      </div>

      <Toaster />
    </Layout>
  )
}

export default PodcastQuotes
