import fetch from 'isomorphic-fetch'

const cache = {}

export default (endpoint = '') => {
  return options => {
    const pool = {}

    return {
      invalidate: key => {
        delete cache[key]
      },

      flush: () => {
        for (let key in cache) {
          delete cache[key]
        }
      },

      get: async (path, cacheOptions = {}) => {
        const key = cacheOptions.key || path
        const miss = cache[key] === undefined || cache[key].expires < Date.now()
        const ignore = cacheOptions.cache === false

        if (miss || ignore) {
          const expires = Date.now() + (cacheOptions.expires || 1000 * 60 * 60 * 24)

          const result = await fetch(`${endpoint}${path}`, options)
            .then(res => res.json())
            .catch(console.error)

          pool[key] = { result, expires }

          if (ignore) {
            return result
          } else {
            cache[key] = { result, expires }
          }
        }

        pool[key] = cache[key]

        return cache[key].result
      },

      dehydrate: () => {
        return Buffer.from(JSON.stringify(pool)).toString('base64')
      },

      hydrate: (dehydrated) => {
        const parsed = JSON.parse(Buffer.from(dehydrated, 'base64').toString())

        for (let key in parsed) {
          cache[key] = parsed[key]
        }
      }
    }
  }
}
