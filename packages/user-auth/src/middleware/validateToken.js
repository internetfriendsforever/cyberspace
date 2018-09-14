const token = require('../token')

module.exports = function validateToken ({ secret, handleError, handleSuccess }) {
  return function (req, res, next) {
    if (req.query.token && !req.query.success && !req.query.error) {
      try {
        const result = JSON.parse(token.read(req.query.token, secret))

        if (Date.now() < result.expires && result.username) {
          req.session.user = result.username
          handleSuccess(req, res, next)
        } else {
          handleError('expired', req, res, next)
        }
      } catch (error) {
        handleError('internal', req, res, next)
      }
    } else {
      next()
    }
  }
}
