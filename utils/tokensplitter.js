import { TokenTextSplitter } from 'langchain/text_splitter'

const measureTokenCount = async (text) => {
  const splitter = new TokenTextSplitter({
    encodingName: 'gpt2',
    chunkSize: 10,
    chunkOverlap: 0,
  })

  const output = await splitter.createDocuments([text])

  console.log('output', output)

  const tokenCount = output[0].tokens.length

  // loop through output and count tokens

  return tokenCount
}

export { measureTokenCount }
