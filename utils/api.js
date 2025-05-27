// utils/api.js

/**
 * Remove all URLs from the server
 * @returns {Promise<void>}
 */
export async function removeAllUrls() {
  const delRequestOptions = {
    method: 'DELETE',
    redirect: 'follow',
  };
  const response = await fetch('/api/urls', delRequestOptions);
  if (!response.ok) throw new Error('Failed to delete all URLs');
  return response.text();
}

/**
 * Remove a specific URL (or URLs by ids) from the server
 * @param {string} id
 * @param {Array} ids
 * @returns {Promise<void>}
 */
export async function removeUrl(id, ids) {
  const delRequestOptions = {
    method: 'DELETE',
    redirect: 'follow',
  };
  const response = await fetch(`/api/urls/${id}?ids=${JSON.stringify(ids)}`, delRequestOptions);
  if (!response.ok) throw new Error('Failed to delete URL');
  return response.text();
}

/**
 * Fetch all URLs from the server
 * @returns {Promise<Array>}
 */
export async function fetchUrls() {
  const response = await fetch('/api/urls');
  if (!response.ok) throw new Error('Failed to fetch URLs');
  return response.json();
}

/**
 * Add one or more URLs to the server
 * @param {Array<string>} urls
 * @param {boolean} internal
 * @returns {Promise<void>}
 */
export async function addUrls(urls, internal = false) {
  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  const postPromises = urls.map((url, index) =>
    new Promise((resolve) =>
      setTimeout(async () => {
        const postRequestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: JSON.stringify({
            url,
            multiple: false,
            internal,
          }),
          redirect: 'follow',
        };
        try {
          const response = await fetch('/api/urls', postRequestOptions);
          resolve(response.ok);
        } catch (error) {
          resolve(false);
        }
      }, 1000 * index)
    )
  );
  await Promise.all(postPromises);
}
