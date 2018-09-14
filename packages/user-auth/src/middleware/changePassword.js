const bcrypt = require('bcrypt')
const bodyParser = require('body-parser')

const saltRounds = 12

module.exports = function changePassword ({ getHash, setHash, handleError, handleSuccess }) {
  return [
    bodyParser.urlencoded({ extended: false }),

    (req, res, next) => {
      const username = req.session.user
      const { oldPassword, newPassword } = req.body

      if (!username) {
        return handleError('requires-authentication', req, res, next)
      }

      if (!oldPassword || !newPassword) {
        return handleError('missing-passwords', req, res, next)
      }

      getHash(username)
        .then(hash => bcrypt.compare(oldPassword, hash))
        .then(isMatch => {
          if (isMatch) {
            return bcrypt.hash(newPassword, saltRounds)
              .then(hash => setHash(username, hash))
              .then(() => handleSuccess(req, res, next))
          } else {
            handleError('incorrect-password', req, res, next)
          }
        })
        .catch(error => {
          handleError('internal', req, res, next)
        })
    }
  ]
}
