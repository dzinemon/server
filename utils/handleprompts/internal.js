export const promptTemplate = (question, questions, sources) => {
  // question is current question
  // questions is array of previous questions
  // sources is array of sources

  const questionString = questions.join(', ')

  const sourcesString = sources
    .map((source) => {
      // for each source in sources, return a string with the source title, url and content

      return `
      Source Title: ${source.metadata.title}
      Source URL: ${source.metadata.url}
      Source Content: ${source.metadata.content}

      `
    })
    .join('')

  if (questions.length === 0) {
    return `Answer the question based on the context below, 
      in context you will have sources title, url, content, use most relevant content and show small references to sources,
      format the answer in Rich Text.

      Question: ${question}
      
      Context: 
      ${sourcesString}
      `
  }

  return `Answer the user's question based on the context below, 
    when replying keep to the context of Previous quesitons, but User's question is the most important,
    in context you will have sources title, url, content, use most relevant content and show small references to sources
    format the answer in Rich Text.
  
    User Question: ${question}
  
    Previous quesitons: ${questionString}
  
    Context: 
    ${sourcesString}
    `
}

export const categories = [
  'Angel Investors',
  'Stock Options',
  'Life Sciences',
  'Startup CFO',
  'Cash Management',
  'Seed Funds',
  'State & Local Taxes',
  'Startup Finance',
  'Startup Accounting',
  'R&D Tax Credits',
  'Fintech Systems',
  'Financial Modeling',
  'Cap Table',
  '83B',
  'Venture Capital',
  'Bookkeeping',
  'Payroll',
  'M&A Support',
  'Venture Debt',
  'eCommerce',
  'Startup Banking',
  'Startup Operations',
  'Tax Credits',
  'Startup Legal',
  'Human Resources',
  'Corporate Credit Cards',
  '409A',
  'Biotechnology',
  'Stock Option Accounting',
  'HR',
  'PEO',
  'Crypto',
  'IRS',
  'Expense Management',
  'Startup Taxes',
  'Startup Founders',
]

export const promptTemplatePodcastQuotes = (topics, sources) => {
  // topics is a string of topics
  // sources is array of sources

  const sourcesString = sources
    .map((source) => {
      // for each source in sources, return a string with the source title, url and content

      return `
      Podcast Title: ${source.title}
      Podcast URL: ${source.url}
      Podcast Content: ${source.content}

      `
    })
    .join('')

  return `I am providing Page Url, Page Title, key topics of the article below, 
    please generate 'Interviewee Quote or Phrase' from the podcast transcripts in the Context below that relates to provided topics if possible:
    **Action**: Scan the podcast transcripts to find relevant sections where the Interviewee shares an actionable tip, how-to advice, or insightful perspective.
    Ensure that the 'Interviewee Quote or Phrase' is a direct and unaltered excerpt from the transcript
    Maintain clarity and brevity, be concise and to the point,
    Per response provide Page Title as Heading, and Page Url as text at the top of response.  
    Per each quote or phrase provide Interviewee Name, position and company name; and the Topic that the quote or phrase relates to,
    Separate each quote or phrase with a solid line and For each Quote or phrase provide the url as reference.

    Page data: 
        ${topics}

    Context:
    ${sourcesString}
    `
}

export const promptTemplatePodcastQuotesV2 = (pageData, source) => {
  // [pageData] is an object with url, name, content
  // [podcastContent] is content of the podcast

  return `I am providing the Podcast Content below,
    Scan the Podcast Content to find relevant sections where the Interviewee shares an actionable tip, how-to advice, or insightful perspective about the Page Topic or Topics provided below:
    Ensure that the 'Interviewee Quote or Phrase' is a direct and unaltered excerpt from the transcript
    Maintain clarity and brevity, be concise and to the point,
    For each Quote or phrase provide the url as reference.
    Per each Interviewee Quote or Phrase provide Solid line at the top, Topic it relates to or describes, Page Title, and Page Url as text, Interviewee Name, position and company name at the top of response.

    Page Topics: ${pageData}
    
    Podcast Title: ${source.name}
    Podcast URL: ${source.url}
    Podcast Content:
        ${source.content}
    `
}

export const promptTemplateCategoriesQuotes = (text, categories) => {
  return `I am providing the Podcast Content below,
    Scan the Podcast Content to find relevant sections where the Interviewee shares an actionable tip, how-to advice, or insightful perspective on the following topics:
    ${categories.join(', ')}
    Ensure that the 'Interviewee Quote or Phrase' is a direct and unaltered excerpt from the transcript
    Maintain clarity and brevity, be concise and to the point,
    Per response provide Category Name as heading 1, Page Title as Heading 2, and Page Url as text at the top of response.

    Podcast Content:
        ${text}
    `
}
