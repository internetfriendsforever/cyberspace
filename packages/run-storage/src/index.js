module.exports = process.env.LOCAL_ROOT
  ? require('./local')
  : require('./remote')
