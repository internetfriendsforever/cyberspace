const pathToRegexp = require('path-to-regexp')

module.exports = {
  resolve: (routes, rawPath) => {
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

      return { key, params }
    }

    return null
  },

  listen: (handler, { initial = true, pop = true, click = true, scroll = true } = {}) => {
    function navigate (path, options = { scroll: true }) {
      const fn = options.replace ? 'replaceState' : 'pushState'
      window.history[fn](null, null, path)

      if (options.scroll || scroll) {
        window.scrollTo(0, 0)
      }

      handler(window.location.pathname, navigate)
    }

    if (initial) {
      handler(window.location.pathname, navigate)
    }

    if (pop) {
      window.addEventListener('popstate', () => {
        handler(window.location.pathname, navigate)
      })
    }

    if (click) {
      window.addEventListener('click', e => {
        const link = e.target.closest('a')
        const ignore = e.ctrlKey || e.shiftKey || e.altKey || e.metaKey

        if (!ignore && link) {
          e.preventDefault()

          const domain = url => url.replace('http://', '').replace('https://', '').split('/')[0]
          const external = domain(window.location.href) !== domain(link.href)

          if (!external) {
            const { pathname, search = '', hash = '' } = link
            navigate(`${pathname}${search}${hash}`)
          } else {
            window.open(link.href)
          }
        }
      })
    }
  }
}

function normalize (path) {
  return `/${path.split('/').filter(v => v).join('/')}`
}
