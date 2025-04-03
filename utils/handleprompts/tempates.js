export const promptTempateQaSources = (question, sources, limit = 12000) => {
  // use the same template as above, but update the context by mapping through sources and limit the size of the prompt

  let accumulatedLength = 0

  const limitedSources = sources.filter((source) => {
    const sourceLength =
      source.title.length + source.url.length + (source.content?.length || 0)
    if (accumulatedLength + sourceLength <= limit) {
      accumulatedLength += sourceLength
      return true
    }
    return false
  })

  return `Provide a concise, professional answer to the given question, drawing exclusively from the provided source materials. Format the response using rich text, including headings and bullet points as needed. Cite sources using their titles and URLs.

Question: ${question}

Sources:
${limitedSources
  .map((source) => {
    return `
    Title: ${source.title}
    URL: ${source.url}
    Content: ${source.content || 'N/A'}
    `
  })
  .join('\n')}`
}

export const promptTempateHD = (question, sources, limit = 12000) => {
  // use the same template as above, but update the context by mapping through sources and limit the size of the prompt

  let accumulatedLength = 0

  const limitedSources = sources.filter((source) => {
    const sourceLength =
      source.title.length + source.url.length + (source.content?.length || 0)
    if (accumulatedLength + sourceLength <= limit) {
      accumulatedLength += sourceLength
      return true
    }
    return false
  })

  return `
  You are an expert in startup accounting, bookkeeping and finance. I will provide you with a question and a set of context sources. Your task is to synthesize the information from these sources to answer the question accurately and concisely.

**Instructions:**

1.  **Answer the Question:** Directly address the provided question based on the content of the provided sources, question might contian recomendations, follow them as well.
2.  **Professional Tone:** Maintain a professional and objective tone.
3.  **Conciseness:** Keep your answer to the point, avoiding unnecessary details or tangents.
4.  **Rich Text Formatting:** Use headings, bullet points, and other appropriate rich text formatting to enhance readability.
5.  **Source Citations:** Cite the sources used to support your answer. Include the source title and URL as a hyperlink for each citation.
6.  **Relevance:** Prioritize the most relevant information from the sources.
7.  **In-Text References:** Reference the sources within the answer itself to indicate where specific information originates using source title and source url, do not add bracketed items without a link put reference on new line.

**Input:**

**Question:** ${question}

**Context:**

${limitedSources
  .map((source) => {
    return `
    **Source Title:** ${source.title}
    **Source URL:** ${source.url}
    **Source Content:** ${source.content || 'No content provided.'}
    `
  })
  .join('\n')}`
}

export const promptTempateQaBase = (question, context) => {
  return `Answer the question based on the context below provide answer in Rich Text Format, use headings and bullet points if necessary:

    Question: ${question}
    
    Context: ${context}
    `
}
