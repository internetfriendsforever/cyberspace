const os = require('os')
const path = require('path')
const http = require('http')
const colors = require('ansi-colors')
const portfinder = require('portfinder')

portfinder.basePort = 3000

module.exports = async ({ projectPath }) => {
  const server = http.createServer(async (request, response) => {
    Object.keys(require.cache).forEach(key => {
      delete require.cache[key]
    })

    const context = {}

    const params = {
      path: request.url,
      httpMethod: request.method,
      headers: request.headers
    }

    const callback = (error, payload = {}) => {
      if (error) {
        response.writeHead(500, { 'Content-Type': 'text/plain' })
        response.end('Internal server error')
        console.log(error)
      } else {
        let body = payload.body

        if (payload.isBase64Encoded) {
          body = Buffer.from(payload.body, 'base64')
        }

        response.writeHead(payload.statusCode || 404, payload.headers || {})
        response.end(body || 'Not found')
      }

      const status = response.statusCode

      let color = colors.gray

      if (status >= 200) {
        color = colors.green
      }

      if (status >= 300) {
        color = colors.blue
      }

      if (status >= 400) {
        color = colors.yellow
      }

      if (status >= 500) {
        color = colors.red
      }

      console.log(color(status), request.method, request.url)
    }

    try {
      const { handler } = require(path.join(projectPath, 'index.js'))

      const result = handler(params, context, (error, payload) => {
        if (error) {
          callback(error)
        } else {
          callback(null, payload)
        }
      })

      if (result) {
        Promise.resolve(result).then(payload => callback(null, payload))
      }
    } catch (error) {
      callback(error)
    }
  })

  const port = await portfinder.getPortPromise()

  server.listen(port, async error => {
    if (error) {
      throw error
    }

    const addresses = []
    const interfaces = os.networkInterfaces()

    Object.keys(interfaces).forEach(key => {
      interfaces[key].forEach(({ internal, family, address }) => {
        if (family === 'IPv4') {
          addresses.push(address)
        }
      })
    })

    const urls = addresses
      .map(address => `http://${address}:${port}/`)
      .map(url => colors.underline(colors.green(url)))

    console.log(`Server listening at port ${port}`)
    console.log('')
    console.log(urls.join('\n'))
    console.log('')
  })
}
