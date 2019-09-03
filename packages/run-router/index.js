const router = require('@cyberspace/router')

module.exports = routes => async (event, context, callback) => {
  const methodRoutes = routes[event.httpMethod] || {}
  const match = router.resolve(methodRoutes, event.path)
  const route = methodRoutes[match.key]

  if (route) {
    return route({
      path: event.path,
      params: match.params,
      headers: event.headers,
      query: event.queryStringParameters,
      queryMultiValue: event.multiValueQueryStringParameters
    })
  } else {
    return {
      statusCode: 404,
      body: `Route not found (${event.httpMethod} ${event.path})`
    }
  }
}
