const router = require('@cyberspace/run-router')
const cache = require('@cyberspace/run-cache')

exports.handler = router({
  GET: {
    '/': async () => ({
      statusCode: 200,
      headers: {
        'Content-Type': 'text/plain; charset=UTF-8',
        'Cache-Control': 'max-age=31557600'
      },
      body: `Cache-Control max-age is set to one year\n${new Date()}`
    })
  },

  POST: {
    '/invalidate': async () => {
      await cache.invalidate()

      return {
        statusCode: 204
      }
    }
  }
})
