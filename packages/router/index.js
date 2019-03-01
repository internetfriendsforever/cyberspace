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

      window.history[fn](options.state || null, null, path)

      const render = handler(window.location.pathname, navigate)

      Promise.resolve(render).then(() => {
        if ('scroll' in options ? options.scroll : scroll) {
          window.scrollTo(0, 0)
        }
      })
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
            const replace = link.hasAttribute('data-replace')
            const scroll = link.getAttribute('data-scroll') !== 'false'
            const options = { replace, scroll }
            navigate([pathname, search, hash].join(''), options)
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
