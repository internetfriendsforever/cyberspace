const path = require('path')
const http = require('http')

module.exports = ({ projectPath }) => {
  const port = 3000

  const server = http.createServer(async (request, response) => {
    Object.keys(require.cache).forEach(key => {
      delete require.cache[key]
    })

    const { handler } = require(path.join(projectPath, 'index.js'))

    const params = {
      path: request.url,
      httpMethod: request.method,
      headers: request.headers
    }

    const context = {}

    const callback = (error, result) => {
      if (error) {
        response.writeHead(500, { 'Content-Type': 'text/plain' })
        response.end('Internal server error')
        console.error(error)
      } else {
        response.writeHead(result.statusCode || 404, result.headers || {})
        response.end(result.body || 'Not found')
      }
    }

    handler(params, context, (error, payload) => {
      if (error) {
        callback(error)
      } else {
        let body = payload.body

        if (payload.isBase64Encoded) {
          body = Buffer.from(payload.body, 'base64')
        }

        callback(null, {
          ...payload,
          body
        })
      }
    })
  })

  server.listen(port, (error) => {
    if (error) {
      throw error
    }

    console.log(`Server is listening on ${port}`)
  })
}
