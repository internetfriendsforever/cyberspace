const path = require('path')
const router = require('@cyberspace/run-router')
const file = require('@cyberspace/run-file')

const staticPath = path.join(__dirname, `src/static`)
const staticHandler = ({ params }) => file(path.join(staticPath, params[0]))

exports.handler = router({
  GET: {
    '/': require('./src/home.js'),
    '/about': require('./src/about.js'),
    '/static/(.*)': staticHandler,
    '/(.*)': require('./src/404.js')
  }
})
