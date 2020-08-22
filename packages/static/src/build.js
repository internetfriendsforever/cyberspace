const fs = require('fs')
const child = require('child_process')
const path = require('path')

module.exports = options => {
  const script = require.resolve(path.join(__dirname, 'invoke'))

  const invoke = child.spawn('node', [script, options.paths.config], {
    cwd: process.cwd(),
    stdio: [null, 'pipe', 'pipe', 'ipc']
  })

  invoke.on('message', data => {
    let output = path.join(options.paths.output, data.url)

    if (!path.extname(output)) {
      output = path.join(output, '/index.html')
    }

    child.execSync(`mkdir -p ${path.dirname(output)}`)
    fs.writeFileSync(output, Buffer.from(data.body))
  })

  invoke.stdout.pipe(process.stdout)
  invoke.stderr.pipe(process.stderr)
}
