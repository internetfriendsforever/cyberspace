const pathToRegexp = require('path-to-regexp')

module.exports = {
  resolve: function (routes, rawPath) {
    const params = {}
    const path = normalize(rawPath)

    const key = Object.keys(routes).find(function (pattern) {
      return pathToRegexp(pattern).test(path)
    })

    if (key) {
      const paramKeys = []

      const values = pathToRegexp(key, paramKeys).exec(path).slice(1)

      paramKeys.forEach(function (key, i) {
        params[key.name] = values[i]
      })
    }

    return {
      key: key,
      params: params
    }
  },

  listen: function (handler, {
    initial = true,
    pop = true,
    click = true,
    scroll = true
  } = {}) {
    function navigate (path, options = {}) {
      const fn = options.replace ? 'replaceState' : 'pushState'

      window.history[fn](null, null, path)

      const scrollOption = 'scroll' in options ? options.scroll : scroll

      if (scrollOption) {
        window.scrollTo(0, 0)
      }

      handler(window.location.pathname, navigate)
    }

    if (initial) {
      handler(window.location.pathname, navigate)
    }

    if (pop) {
      window.addEventListener('popstate', function () {
        handler(window.location.pathname, navigate)
      })
    }

    if (click) {
      window.addEventListener('click', function (e) {
        const link = e.target.closest('a')
        const ignore = e.ctrlKey || e.shiftKey || e.altKey || e.metaKey

        if (!ignore && link) {
          e.preventDefault()

          const domain = function (url) {
            return url.replace('http://', '').replace('https://', '').split('/')[0]
          }

          const external = domain(window.location.href) !== domain(link.href)

          if (!external) {
            const pathname = link.pathname
            const search = link.search || ''
            const hash = link.hash || ''
            navigate([pathname, search, hash].join(''))
          } else {
            window.open(link.href)
          }
        }
      })
    }
  }
}

function normalize (path) {
  return '/' + path
    .split('/')
    .filter(function (value) { return value })
    .join('/')
}
