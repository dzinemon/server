

export const promptTemplate = (
  question, questions, sources
) => {
  // question is current question
  // questions is array of previous questions
  // sources is array of sources




  

  const questionString = questions.join(', ')

  const sourcesString = sources.map((source) => {
    // for each source in sources, return a string with the source title, url and content

    return `
      Source Title: ${source.metadata.title}
      Source URL: ${source.metadata.url}
      Source Content: ${source.metadata.content}

      `
    }).join('')


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
