const URL = require('url')
const queryString = require('query-string')
const router = require('@cyberspace/router')

module.exports = routes => async (event, context, callback) => {
  try {
    const methodRoutes = routes[event.httpMethod]
    const match = router.resolve(methodRoutes, event.path)
    const route = methodRoutes[match.key]

    if (route) {
      const response = await route({
        path: event.path,
        params: match.params,
        query: queryString.parse(URL.parse(event.path).search)
      })

      callback(null, response)
    } else {
      throw new Error('Route not found')
    }
  } catch (error) {
    console.error(error)
    callback(error)
  }
}
