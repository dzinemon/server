import axios from 'axios'
import { load } from 'cheerio'

// need to fetch url , get page title, remove head, header, nav and footer get innerText
// return object with title and text

export const getHtml = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
      },
      timeout: 10000, // Optional: specify a timeout for the request
    })

    if (response.status === 200) {
      console.log('Response status:', response.status)
      return response.data
    } else {
      console.error('Unexpected status code:', response.status)
    }
  } catch (error) {
    if (error.response) {
      // Server responded with a status other than 2xx
      console.error('Error response data:', error.response.data)
      console.error('Error response status:', error.response.status)
      console.error('Error response headers:', error.response.headers)
    } else if (error.request) {
      // Request was made but no response received
      console.error('Error request:', error.request)
    } else {
      // Something else caused the error
      console.error('Error message:', error.message)
    }
    console.error('Error config:', error.config)
  }
}
export const getCheerio = async (url) => {
  const html = await getHtml(url)
  // console.log('html', html)
  const $ = load(html)
  return $
}

export const parseWithCheerio = async (url) => {
  const $ = await getCheerio(url)
  let title = $('title').text()
  if (title.length > 255) {
    title = title.substring(0, 252) + '...'
  }

  //get og:image content
  let ogImage

  const pageType =
    $('meta[property="kruze:source"]').attr('content') || 'webpage'

  // get domain name
  const domain = new URL(url).hostname

  const source = domain.includes('kruze')
    ? 'website'
    : domain.includes('irs')
    ? 'irs'
    : 'external'

  let text = ''

  // if url starts with 'https://kruze' use parseInternalWithCheerio otherwise use parseExternalWithCheerio

  if (url.startsWith('https://kruze')) {
    console.log('PARSING INTERNAL ...')
    ogImage = $('meta[property="og:image"]').attr('content').trim()
    text = $('body')
      .find('nav')
      .remove()
      .end()
      .find('#toc-section')
      .remove()
      .end()
      .find($('iframe'))
      .remove()
      .end()
      .find($('.modal'))
      .remove()
      .end()
      .find($('.global-footer'))
      .remove()
      .end()
      .find($('.dynamic-footer'))
      .remove()
      .end()
      .find($('.sk-ip'))
      .remove()
      .end()
      .find('#contact')
      .remove()
      .end()
      .find($('#pricing').parents('section'))
      .remove()
      .end()
      .find($('#about').parents('section'))
      .remove()
      .end()
      .find($('#rates').parents('section'))
      .remove()
      .end()
      .find('footer')
      .remove()
      .end()
      .find('script')
      .remove()
      .end()
      .find('noscript')
      .remove()
      .end()
      .find('style')
      .remove()
      .end()
      .text()
  } else if (url.startsWith('https://www.irs.gov')) {
    console.log('PARSING IRS ...')
    const ogImageMeta = $('meta[property="og:image"]').attr('content')
    ogImage = ogImageMeta
      ? ogImageMeta.trim()
      : 'https://www.irs.gov/pub/image/logo_small.jpg'
    text = $('body')
      .find('nav')
      .remove()
      .end()
      .find('footer')
      .remove()
      .end()
      .find('script')
      .remove()
      .end()
      .find('noscript')
      .remove()
      .end()
      .find('style')
      .remove()
      .end()
      .find($('.content > .field > .row > .col-md-4'))
      .remove()
      .end()
      .find($('.region-sidebar-first'))
      .remove()
      .end()
      .text()
  } else {
    console.log('PARSING EXTERNAL ...')

    ogImage = $('body img').attr('src')

    text = $('body')
      .find('nav')
      .remove()
      .end()
      .find('footer')
      .remove()
      .end()
      .find('script')
      .remove()
      .end()
      .find('noscript')
      .remove()
      .end()
      .find('style')
      .remove()
      .end()
      .text()
  }

  const theString = text.trim()
  const newStr = theString.replace(/\s+/g, ' ')
  console.log('Text length', newStr.length)
  return {
    pageContent: newStr,
    pageUrl: url,
    name: title,
    ogImage: ogImage,
    source: source,
    pageType: pageType,
  }
}

export const parsePodcastWithCheerio = async (url) => {
  const $ = await getCheerio(url)
  let title = $('title').text()
  if (title.length > 255) {
    title = title.substring(0, 252) + '...'
  }

  //get og:image content
  let ogImage

  const pageType =
    $('meta[property="kruze:source"]').attr('content') || 'webpage'

  // get domain name
  const domain = new URL(url).hostname

  const source = domain.includes('kruze')
    ? 'website'
    : domain.includes('irs')
    ? 'irs'
    : 'external'

  ogImage = $('meta[property="og:image"]').attr('content').trim()

  let text = $('body')
    .find('nav')
    .remove()
    .end()
    .find('#toc-section')
    .remove()
    .end()
    .find($('iframe'))
    .remove()
    .end()
    .find($('.modal'))
    .remove()
    .end()
    .find($('.global-footer'))
    .remove()
    .end()
    .find($('.dynamic-footer'))
    .remove()
    .end()
    .find($('.sk-ip'))
    .remove()
    .end()
    .find('#contact')
    .remove()
    .end()
    .find($('#pricing').parents('section'))
    .remove()
    .end()
    .find($('#about').parents('section'))
    .remove()
    .end()
    .find($('#rates').parents('section'))
    .remove()
    .end()
    .find('footer')
    .remove()
    .end()
    .find('script')
    .remove()
    .end()
    .find('noscript')
    .remove()
    .end()
    .find('style')
    .remove()
    .end()
    .text()
  $('tr')
    .filter(function () {
      return $(this).find('td:first').text().includes('Scott')
    })
    .remove()

  const theString = text.trim()
  const newStr = theString.replace(/\s+/g, ' ')
  console.log('Text length', newStr.length)
  return {
    pageContent: newStr,
    pageUrl: url,
    name: title,
    ogImage: ogImage,
    source: source,
    pageType: pageType,
  }
}
