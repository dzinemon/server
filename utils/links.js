// utils/links.js

/**
 * Parse user input containing URLs in various formats (newlines, commas, spaces)
 * @param {string} input - Raw user input containing URLs
 * @returns {string[]} - Array of cleaned, unique URLs
 */
export function parseUrls(input) {
  if (!input || typeof input !== 'string') {
    return [];
  }

  // Step 1: Handle different separators (newlines, commas, spaces)
  let urls = [];
  if (input.includes('\n')) {
    urls = input.split('\n');
  } else if (input.includes(',')) {
    urls = input.split(',');
  } else {
    urls = input.split(' ');
  }

  // Step 2: Clean up each URL
  urls = urls
    .map(url => url.trim())
    .filter(url => url.length > 0)
    .filter(url => {
      try {
        new URL(url);
        return true;
      } catch {
        try {
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            new URL(`https://${url}`);
            return true;
          }
          return false;
        } catch {
          return false;
        }
      }
    })
    .map(url => {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return `https://${url}`;
      }
      return url;
    });

  // Step 3: Remove duplicates
  return [...new Set(urls)];
}
