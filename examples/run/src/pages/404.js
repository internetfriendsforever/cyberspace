const html = require('../html')

module.exports = () => html({
  statusCode: 404,
  title: 'Not found',
  body: 'Page not found'
})
