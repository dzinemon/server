import { parseWithCheerio } from "../../../../utils/cheerio-axios";

const  parseUrl = async (req, res) => {

  const { url } = req.body;

  const {
    pageContent,
    pageUrl,
    name,
    ogImage,
    pageType,
    source,
  } = await parseWithCheerio(url);

  res.status(200).json({
    pageContent,
    pageUrl,
    name,
    ogImage,
    pageType,
    source,
  });
}

export const config = {
  maxDuration: 200,
};

export default function handler(req, res) {
  switch (req.method) {
    case 'POST':
      return parseUrl(req, res)
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}