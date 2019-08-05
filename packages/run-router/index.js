const URL = require('url')
const queryString = require('query-string')
const router = require('@cyberspace/router')

module.exports = routes => async (event, context, callback) => {
  try {
    const methodRoutes = routes[event.httpMethod] || {}
    const match = router.resolve(methodRoutes, event.path)
    const route = methodRoutes[match.key]

    if (route) {
      return route({
        path: event.path,
        params: match.params,
        query: queryString.parse(URL.parse(event.path).search)
      })
    } else {
      return {
        statusCode: 404,
        body: `Not found (${event.httpMethod} ${event.path})`
      }
    }
  } catch (error) {
    throw error
  }
}
