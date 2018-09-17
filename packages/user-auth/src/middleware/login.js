const bcrypt = require('bcrypt')
const bodyParser = require('body-parser')

module.exports = function login ({ getHash, handleError, handleSuccess }) {
  return [
    bodyParser.urlencoded({ extended: false }),

    (req, res, next) => {
      const { username, password } = req.body

      if (!username || !password) {
        return handleError('missing-credentials', req, res, next)
      }

      getHash(username)
        .then(hash => bcrypt.compare(password, hash))
        .then(isMatch => {
          if (isMatch) {
            req.session.user = username
            req.session.authentication = 'password'
            handleSuccess(req, res, next)
          } else {
            handleError('incorrect-credentials', req, res, next)
          }
        })
        .catch(error => {
          handleError('incorrect-credentials', req, res, next)
        })
    }
  ]
}
