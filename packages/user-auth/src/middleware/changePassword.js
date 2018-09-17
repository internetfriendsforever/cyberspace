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

      if (!newPassword) {
        return handleError('missing-password', req, res, next)
      }

      const updateHash = () => bcrypt.hash(newPassword, saltRounds)
        .then(hash => setHash(username, hash))
        .then(() => handleSuccess(req, res, next))
        .catch(error => {
          handleError('internal', req, res, next)
        })

      if (req.session.authentication === 'email') {
        return updateHash()
      }

      if (!oldPassword) {
        return handleError('missing-password', req, res, next)
      }

      getHash(username)
        .then(hash => bcrypt.compare(oldPassword, hash))
        .then(isMatch => {
          if (isMatch) {
            updateHash()
          } else {
            handleError('incorrect-password', req, res, next)
          }
        }).catch(error => {
          handleError('internal', req, res, next)
        })
    }
  ]
}
