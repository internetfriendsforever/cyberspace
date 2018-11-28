var pathToRegexp = require('path-to-regexp')

module.exports = {
  resolve: function (routes, rawPath) {
    var keys = []

    var path = normalize(rawPath)

    var key = Object.keys(routes).find(function (pattern) {
      return pathToRegexp(pattern).test(path)
    })

    var route = routes[key] || routes['404']

    if (route) {
      var params = {}

      if (key) {
        var values = pathToRegexp(key, keys).exec(path).slice(1)

        keys.forEach(function (key, i) {
          params[key.name] = values[i]
        })
      }

      return {
        key: key,
        params: params
      }
    }

    return null
  },

  listen: function (handler, {
    initial = true,
    pop = true,
    click = true,
    scroll = true
  } = {}) {
    function navigate (path, options = {}) {
      var fn = options.replace ? 'replaceState' : 'pushState'

      window.history[fn](null, null, path)

      if ((options && options.scroll) || scroll) {
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
        var link = e.target.closest('a')
        var ignore = e.ctrlKey || e.shiftKey || e.altKey || e.metaKey

        if (!ignore && link) {
          e.preventDefault()

          var domain = function (url) {
            return url.replace('http://', '').replace('https://', '').split('/')[0]
          }

          var external = domain(window.location.href) !== domain(link.href)

          if (!external) {
            var pathname = link.pathname
            var search = link.search || ''
            var hash = link.hash || ''
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
