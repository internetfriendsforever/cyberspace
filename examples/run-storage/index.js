const router = require('@cyberspace/run-router')
const storage = require('@cyberspace/run-storage')

exports.handler = router({
  GET: {
    '/': async () => ({
      statusCode: 200,
      headers: {
        'Content-Type': 'text/plain; charset=UTF-8',
        'Cache-Control': 'max-age=0'
      },
      body: `Time stored: ${await storage.get('time')}`
    })
  },

  POST: {
    '/update': async () => {
      await storage.put('time', new Date().toString())

      return {
        statusCode: 204
      }
    }
  }
})
