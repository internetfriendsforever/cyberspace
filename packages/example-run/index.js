const router = require('@cyberspace/run-router')
const file = require('@cyberspace/run-file')

exports.handler = router({
  GET: {
    '/': require('./src/home.js'),
    '/about': require('./src/about.js'),
    '/static/(.*)': ({ params }) => file(`src/static/${params[0]}`),
    '(.*)': require('./src/404.js')
  }
})
