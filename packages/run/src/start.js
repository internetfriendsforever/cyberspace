const { default: PQueue } = require('p-queue')
const os = require('os')
const url = require('url')
const path = require('path')
const http = require('http')
const querystring = require('querystring')
const colors = require('ansi-colors')
const portfinder = require('portfinder')

portfinder.basePort = 3000

module.exports = async ({ projectPath }) => {
  process.env.LOCAL_ROOT = projectPath

  const queue = new PQueue({
    concurrency: 1
  })

  const server = http.createServer(async (request, response) => {
    queue.add(() => {
      // Clear project file cache
      Object.keys(require.cache).forEach(key => {
        const inProject = key.startsWith(projectPath)

        if (inProject) {
          delete require.cache[key]
        }
      })

      const context = {}

      const event = formatEvent(request)

      const callback = (error, {
        statusCode = 200,
        headers = {},
        body = '',
        isBase64Encoded = false
      } = {}) => {
        if (error) {
          console.log(error)
          response.writeHead(500, { 'Content-Type': 'text/plain' })
          response.end('Internal server error')
        } else {
          response.writeHead(statusCode, headers)

          if (isBase64Encoded) {
            response.end(Buffer.from(body, 'base64'))
          } else {
            response.end(body)
          }
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

        const result = handler(event, context, (error, payload) => {
          if (error) {
            callback(error)
          } else {
            callback(null, payload)
          }
        })

        if (result) {
          return Promise.resolve(result).then(payload => callback(null, payload))
        }
      } catch (error) {
        return Promise.reject(callback(error))
      }
    })
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

function formatEvent (request) {
  const urlParts = url.parse(request.url)
  const query = querystring.parse(urlParts.query)

  const queryStringParameters = {}
  const multiValueQueryStringParameters = {}

  for (let key in query) {
    const value = query[key]

    if (Array.isArray(value)) {
      queryStringParameters[key] = value[value.length - 1]
      multiValueQueryStringParameters[key] = value
    } else {
      queryStringParameters[key] = value
      multiValueQueryStringParameters[key] = [value]
    }
  }

  const event = {
    path: urlParts.pathname,
    httpMethod: request.method,
    headers: request.headers,
    queryStringParameters,
    multiValueQueryStringParameters
  }

  return event
}
