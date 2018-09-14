const cookieSession = require('cookie-session')

module.exports = function initialize ({ secret }) {
  return [
    cookieSession({
      secret,
      maxAge: 24 * 60 * 60 * 1000
    })
  ]
}
