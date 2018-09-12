const auth = require('basic-auth')

module.exports = function ({ users, failure }) {
  return (req, res, next) => {
    const credentials = auth(req)

    if (credentials && check(credentials, users)) {
      next()
    } else {
      res.status(401)
      res.set('WWW-Authenticate', 'Basic')

      if (failure) {
        failure(req, res, next)
      } else {
        res.end('Access denied')
      }
    }
  }
}

function check (credentials, users) {
  return users.find(other => (
    credentials.name === other.username &&
    credentials.pass === other.password
  ))
}
