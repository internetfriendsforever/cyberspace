const fs = require('fs')
const path = require('path')
const express = require('express')

const router = new express.Router()

const maxAge = 31536000
const buildPath = path.join(process.cwd(), 'build')

router.use(express.static(path.join(buildPath, 'static'), {
  immutable: true,
  maxAge: maxAge
}))

try {
  const clientFilename = fs.readFileSync(path.join(buildPath, 'scripts/client'), 'utf-8')
  const clientPath = path.join(buildPath, clientFilename)

  router.get('/client.js', (req, res, next) => {
    const cacheControl = `public,max-age=${maxAge},immutable`
    res.set('Cache-Control', cacheControl).sendFile(clientPath)
  })
} catch (error) {
  console.error('Could not load client file. Ignoring...')
}

module.exports = router
