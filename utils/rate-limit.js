import { LRUCache } from 'lru-cache'

function rateLimit(options = {}) {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000,
  })

  return {
    check: (res, limit, token) =>
      new Promise((resolve, reject) => {
        let tokenCount = tokenCache.get(token) || [0]
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount)
        }
        tokenCount[0] += 1

        const currentUsage = tokenCount[0]
        const isRateLimited = currentUsage >= limit
        res.setHeader('X-RateLimit-Limit', limit)
        res.setHeader(
          'X-RateLimit-Remaining',
          isRateLimited ? 0 : limit - currentUsage
        )

        console.log('isRateLimited', isRateLimited)

        return isRateLimited ? reject() : resolve()
      }),
  }
}

module.exports = rateLimit
