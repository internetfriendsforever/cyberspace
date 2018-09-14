const url = require('url')
const bodyParser = require('body-parser')
const token = require('../token')
const mail = require('../mail')

module.exports = function requestToken ({ secret, getEmail, handleError, handleSuccess, smtp, template }) {
  return [
    bodyParser.urlencoded({ extended: false }),

    (req, res, next) => {
      const username = req.body.username

      if (!username) {
        return handleError('missing-user', req, res, next)
      }

      getEmail(username)
        .then(email => {
          if (!email) {
            return handleError('no-user', req, res, next)
          }

          const templateParams = {
            search: url.format({
              query: {
                token: token.create(JSON.stringify({
                  username: username,
                  expires: Date.now() + 1000 * 60 * 60
                }), secret),
                successRedirect: req.query.validRedirect
              }
            })
          }

          return template(templateParams).then(params => (
            mail.send(smtp, Object.assign({ to: email }, params))
          )).then(result => {
            console.log('Message sent:', result.id)

            if (result.previewUrl) {
              console.log('Preview:', result.previewUrl)
            }
          })
        })
        .then(() => handleSuccess(req, res, next))
        .catch(error => {
          console.error(error)
          return handleError('internal', req, res, next)
        })
    }
  ]
}
