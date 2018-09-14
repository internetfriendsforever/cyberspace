module.exports = {
  api: require('./src/middleware/api'),
  initialize: require('./src/middleware/initialize'),
  login: require('./src/middleware/login'),
  logout: require('./src/middleware/logout'),
  requestToken: require('./src/middleware/requestToken'),
  validateToken: require('./src/middleware/validateToken')
}
