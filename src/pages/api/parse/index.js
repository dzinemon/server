import { parseWithCheerio } from "../../../../utils/cheerio-axios";

const  parseUrl = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  const { url } = req.body;

  if (!url) {
    res.status(400).json({ error: "URL is required" });
    return;
  }

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


export default function handler(req, res) {
  switch (req.method) {
    case 'POST':
      return parseUrl(req, res)
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}