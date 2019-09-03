const answer = require('the-answer')
const html = require('../html')

module.exports = ({ path, headers, query, queryMultiValue }) => html({
  path,
  title: 'Home',
  content: `
    The answer to the ultimate question of life, the universe, and everything
    is ${answer}!
    <pre>${JSON.stringify({ path, headers, query, queryMultiValue }, null, 2)}</pre>
  `
})
