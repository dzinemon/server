import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const createClaudeCompletion = async (
  prompt,
  model,
  temperature,
  instructions,
  maxTokens
)  => {

  try {

    const response = await anthropic.messages.create({
      model,
      max_tokens: parseInt(maxTokens),
      temperature: parseInt(temperature),
      system: instructions,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            }
          ]
        }
      ]
    });
  
    console.log(response);
    return response.content[0].text;
  } catch (error) {
    console.error('Error creating completion:', error);
    throw error;
  }
}

const createClaudeCompletionMessage = async (
  messages,
  model,
  temperature
)  => {

  try {

    const response = await anthropic.messages.create({
      model,
      max_tokens: 8192,
      temperature: parseInt(temperature),
      messages
    });
  
    console.log(response);
    return response.content[0].text;
  } catch (error) {
    console.error('Error creating completion:', error);
    throw error;
  }
}

export { createClaudeCompletion, createClaudeCompletionMessage };

