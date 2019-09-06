const fs = require('fs')
const { spawn } = require('child_process')
const S3 = require('aws-sdk/clients/s3')

const bucket = process.env.BUCKET
const region = process.env.REGION

const s3 = new S3({ region })

exports.handler = async () => {
  const tmp = `/tmp`
  const target = `${tmp}/target`

  await clean(target)
  await download('source.tar', `${tmp}/source.tar`)
  await unpack(`${tmp}/source.tar`, target)

  const { dependencies = [] } = require(`${target}/package.json`)

  if (dependencies.length) {
    console.log(`Installing ${dependencies.length} dependencies...`)

    await shell('npm', [
      'install',
      '--prefix', target,
      '--cache', target,
      '--production',
      '--loglevel', 'error',
      '--no-update-notifier'
    ], {
      cwd: target
    })
  } else {
    console.log('No dependencies to install, skipping!')
  }

  const modules = [
    'archiver@3.1.1'
  ]

  const modulesFilename = `${modules.join(',')}.tar`
  const modulesPath = `${tmp}/${modulesFilename}`
  const modulesFolder = `${tmp}/node_modules`

  try {
    await download(modulesFilename, modulesPath)
    await shell('mkdir', ['-p', modulesFolder])
    await unpack(modulesPath, modulesFolder)
  } catch (error) {
    await shell('npm', [
      'install',
      ...modules,
      '--prefix', tmp,
      '--cache', tmp,
      '--loglevel', 'error',
      '--no-update-notifier'
    ])

    await pack(modulesFolder, modulesPath)
    await upload(modulesFilename, modulesPath)
  }

  console.log('Creating zip archive')

  const archiver = require(`${modulesFolder}/archiver`)
  const archive = archiver.create('zip')

  archive.directory(target, false)
  archive.finalize()

  await upload('target.zip', archive)

  console.log('Done')
}

async function upload (key, source) {
  console.log('Uploading', key)

  const body = typeof source === 'string'
    ? fs.createReadStream(source)
    : source

  return s3.upload({
    Bucket: bucket,
    Key: key,
    Body: body
  }).promise()
}

async function download (key, target) {
  console.log('Downloading', key, 'to', target)

  const body = await s3.getObject({
    Bucket: bucket,
    Key: key
  }).promise()

  fs.writeFileSync(target, body.Body)
}

async function unpack (source, target) {
  console.log('Unpacking', source, 'into', target)
  return shell('tar', ['-xf', source, '-C', target])
}

async function pack (source, target) {
  console.log('Packing', source, 'into', target)
  return shell('tar', ['-cf', target, '-C', source, '.'])
}

async function clean (target) {
  console.log('Cleaning', target)
  await shell('rm', ['-rf', target])
  await shell('mkdir', ['-p', target])
}

function shell (command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    console.log('Shell:', command, args.join(' '), options)

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
