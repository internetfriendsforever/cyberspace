const html = require('../html')

module.exports = ({ path }) => html({
  path,
  statusCode: 404,
  title: 'Not found',
  content: 'Sorry, the page you are looking for was not found. Go to <a href="/">home</a>'
})
