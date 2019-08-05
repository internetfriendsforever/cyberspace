const answer = require('the-answer')
const html = require('../html')

module.exports = () => html({
  title: 'Hello',
  body: `The answer to the ultimate question of life, the universe, and everything is ${answer}`
})
