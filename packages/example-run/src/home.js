const answer = require('the-answer')
const page = require('./page')

module.exports = () => page({
  title: 'Hello',
  body: `The answer to the ultimate question of life, the universe, and everything is ${answer}`
})
