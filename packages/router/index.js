const pathToRegexp = require('path-to-regexp')

module.exports = {
  resolve: (routes, rawPath, ...args) => {
    let keys = []

    const path = normalize(rawPath)
    const key = Object.keys(routes).find(pattern => pathToRegexp(pattern).test(path))
    const route = routes[key] || routes['404']

    if (route) {
      const params = {}

      if (key) {
        const values = pathToRegexp(key, keys).exec(path).slice(1)

        keys.forEach((key, i) => {
          params[key.name] = values[i]
        })
      }

      return route(params, ...args)
    }

    return null
  }
}

function normalize (path) {
  return `/${path.split('/').filter(v => v).join('/')}`
}
