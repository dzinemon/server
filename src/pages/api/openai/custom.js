import { 
  createChatCompletionCustom
 } from '../../../../utils/openai'

 import {
  createClaudeCompletion
 } from '../../../../utils/anthropic'

// import data from '../../../../data/data.json';

// import checkRequestOrigin from '../../../../utils/checkRequestOrigin'

const postUrl = async (req, res) => {
  const { 
    prompt, model, temperature, instructions, maxTokens } = req.body

  // if model contains gpt then use openai

  let completion = '';
  
  if (model.includes('gpt')) {
    console.log('using openai')
  
  completion = await createChatCompletionCustom(
    prompt, model, temperature, instructions, maxTokens
  )} else {
    console.log('using anthropic')
    completion = await createClaudeCompletion(
      prompt, model, temperature, instructions, maxTokens
    )
  }


  res.status(200).json({ completion })
}

export const config = {
  maxDuration: 200,
};

export default function handler(req, res) {
  switch (req.method) {
    case 'POST':
      return postUrl(req, res)
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
