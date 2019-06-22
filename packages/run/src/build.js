const S3 = require('aws-sdk/clients/s3')
const { spawn } = require('child_process')

exports.handler = async () => {
  const s3 = new S3({
    region: process.env.REGION
  })

  const root = `/tmp`
  const target = `${root}/target`

  console.log(`Removing ${target} if it already exists...`)

  await shell('rm', ['-rf', target])

  console.log('Installing unzip...')

  await shell('npm', ['install', 'unzip@0.1.11', '--prefix', root, '--cache', root], { cwd: root })
  const unzip = require(`${root}/node_modules/unzip`)

  await new Promise((resolve, reject) => {
    console.log(`Downloading source...`)

    s3.getObject({
      Bucket: process.env.BUCKET,
      Key: 'source.zip'
    }).createReadStream()
      .pipe(unzip.Extract({ path: target }))
      .on('close', resolve)
  })

  console.log('Installing dependencies...')

  await shell('npm', ['install', '--prefix', target, '--cache', target, '--production'], { cwd: target })

  console.log('Installing archiver...')

  await shell('npm', ['install', 'archiver@3.0.0', '--prefix', root, '--cache', root], { cwd: root })

  const archiver = require(`${root}/node_modules/archiver`)
  const archive = archiver.create('zip')

  archive.directory(target, false)
  archive.finalize()

  console.log(`Uploading build...`)

  await s3.upload({
    Bucket: process.env.BUCKET,
    Key: 'build.zip',
    Body: archive
  }).promise()

  console.log('Done')
}

function shell (command, args = [], options) {
  return new Promise((resolve, reject) => {
    console.log(command, args, options)

    const process = spawn(command, args, options)

    process.stdout.on('data', chunk => {
      console.log('[' + command + ':stdout] ' + chunk)
    })

    process.stderr.on('data', chunk => {
      console.log('[' + command + ':stderr] ' + chunk)
    })

    process.on('error', error => {
      reject(error)
    })

    process.on('close', (code, signal) => {
      if (signal) {
        reject(new Error(`Process killed with signal ${signal}`))
      } else if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Process exited with code ${code}`))
      }
    })
  })
}
