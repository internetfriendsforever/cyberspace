const fetch = require('isomorphic-fetch')

const cache = {}

module.exports = function (endpoint, options) {
  endpoint = endpoint || ''

  return function (options) {
    options = options || {}

    const pool = {}

    return {
      invalidate: function (key) {
        delete cache[key]
      },

      flush: function () {
        for (let key in cache) {
          delete cache[key]
        }
      },

      get: function (path, cacheOptions) {
        cacheOptions = cacheOptions || {}

        return new Promise(function(resolve, reject) {
          const key = cacheOptions.key || path
          const miss = cache[key] === undefined || cache[key].expires < Date.now()
          const ignore = cacheOptions.cache === false

          if (miss || ignore) {
            const expires = Date.now() + (cacheOptions.expires || 1000 * 60 * 60 * 24)

            return fetch(endpoint + path, options)
              .then(function (res) {
                return res.json()
              })
              .then(function (result) {
                pool[key] = {
                  result: result,
                  expires: expires
                }

                if (ignore) {
                  resolve(result)
                } else {
                  cache[key] = {
                    result: result,
                    expires: expires
                  }

                  pool[key] = cache[key]
                  resolve(cache[key].result)
                }
              })
              .catch(reject)
          }

          pool[key] = cache[key]
          resolve(cache[key].result)
        })
      },

      dehydrate: function () {
        return JSON.stringify(pool)
      },

      hydrate: function (dehydrated) {
        for (let key in dehydrated) {
          cache[key] = dehydrated[key]
        }
      }
    }
  }
}
