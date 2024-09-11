import { parseWithCheerio } from "../../../../utils/cheerio-axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  const { url, internal } = req.body || {};

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
  } = await parseWithCheerio(url, internal);

  res.status(200).json({
    pageContent,
    pageUrl,
    name,
    ogImage,
    pageType,
    source,
  });
}

