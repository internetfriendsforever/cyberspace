const fs = require('fs')
const child = require('child_process')
const path = require('path')
const http = require('http')
const mime = require('mime')

module.exports = options => {
  const sitemap = require.resolve(path.join(options.folder, options.sitemap || 'sitemap.js'))
  const script = require.resolve(path.join(__dirname, 'invoke'))

  const server = http.createServer((req, res) => {
    const invoke = child.spawn('node', [script, sitemap, req.url], {
      cwd: process.cwd(),
      stdio: [null, 'pipe', 'pipe', 'ipc']
    })

    invoke.on('message', data => {
      if (data.missing) {
        console.log(req.method, req.url, 404)
        res.statusCode = 404
        res.write(`${req.url} not found`)
        res.end()
      } else {
        console.log(req.method, req.url, 200)
        res.statusCode = 200
        res.setHeader('Content-Type', mime.getType(path.extname(req.url) || 'html'))
        res.write(data.body)
        res.end()
      }
    })

    invoke.stderr.on('data', () => {
      console.log(req.method, req.url, 500)
      res.statusCode = 500
    })

    invoke.stdout.pipe(process.stdout)
    invoke.stderr.pipe(process.stderr)
    invoke.stderr.pipe(res)
  })

  server.listen(3000, () => {
    console.log('Server listening on', server.address().port)
  })
}
