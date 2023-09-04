import axios from 'axios'
import cheerio from 'cheerio'

// need to fetch url , get page title, remove head, header, nav and footer get innerText
// return object with title and text

export const getHtml = async (url) => {
  try {
    return await axios.get(url)
  } catch (error) {
    console.error(error)
  }
}
export const getCheerio = async (url) => {
  const html = await getHtml(url)
  return cheerio.load(html.data)
}

export const parseWithCheerio = async (url) => {
  const $ = await getCheerio(url)
  const title = $('title').text()

  let text = ''

  // if url starts with 'https://kruze' use parseInternalWithCheerio otherwise use parseExternalWithCheerio

  if (url.startsWith('https://kruze')) {
    console.log('PARSING INTERNAL ...')
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
  }
}
