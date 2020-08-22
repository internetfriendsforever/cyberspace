const fs = require('fs')
const child = require('child_process')
const path = require('path')

module.exports = options => {
  console.log('Not implemented yet')
  console.log('TODO: Save files')

  const sitemap = require.resolve(path.join(options.folder, options.sitemap || 'sitemap.js'))
  const script = require.resolve(path.join(__dirname, 'invoke'))

  const invoke = child.spawn('node', [script, sitemap], {
    cwd: process.cwd(),
    stdio: [null, 'pipe', 'pipe', 'ipc']
  })

  invoke.on('message', data => {
    console.log(data.url, Buffer.from(data.body).length, 'bytes')
  })

  invoke.stdout.pipe(process.stdout)
  invoke.stderr.pipe(process.stderr)
}
