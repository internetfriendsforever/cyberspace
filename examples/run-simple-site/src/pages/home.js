const answer = require('the-answer')
const html = require('../html')

module.exports = ({ path, query, queryMultiValue }) => html({
  path,
  title: 'Home',
  content: `
    The answer to the ultimate question of life, the universe, and everything
    is ${answer}!
    <pre>${JSON.stringify({ query, queryMultiValue })}</pre>
  `
})
