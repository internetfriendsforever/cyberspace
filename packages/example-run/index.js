const path = require('path')
const router = require('@cyberspace/run-router')
const file = require('@cyberspace/run-file')
const styles = require('@cyberspace/styles')

const staticPath = path.join(__dirname, `src/assets`)
const staticHandler = ({ params }) => file(path.join(staticPath, params[0]))

const stylesHandler = () => ({
  statusCode: 200,
  headers: { 'Content-Type': 'text/css' },
  body: styles.toString()
})

exports.handler = router({
  GET: {
    '/': require('./src/pages/home.js'),
    '/about': require('./src/pages/about.js'),
    '/assets/(.*)': staticHandler,
    '/styles.css': stylesHandler,
    '/(.*)': require('./src/pages/404.js')
  }
})
