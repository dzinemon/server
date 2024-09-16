import { chatCompletionMessages } from '../../../../utils/openai';

const postUrl = async (req, res) => {
  const { messages, model, temperature } = req.body;

  try {
    let completion = '';

    completion = await chatCompletionMessages(
      messages,
      model,
      temperature
    );

    res.status(200).json({ completion });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const config = {
  maxDuration: 200,
};

export default function handler(req, res) {
  switch (req.method) {
    case 'POST':
      return postUrl(req, res);
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
