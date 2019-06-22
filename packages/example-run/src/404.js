const page = require('./page')

module.exports = () => page({
  statusCode: 404,
  title: 'Not found',
  body: 'Page not found'
})
