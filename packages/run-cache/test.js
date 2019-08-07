const cache = require('./src/remote')

process.env.REGION = 'eu-west-1'
process.env.DISTRIBUTION = 'E1AIMJNO19SVHJ'

console.time('Invalidate')

cache.invalidate()
  .then(() => console.log('Complete'))
  .then(() => console.timeEnd('Invalidate'))
  .catch(error => console.log(error))
