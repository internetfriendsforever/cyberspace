const url = require('url')
const crypto = require('crypto')
const bcrypt = require('bcrypt')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const passport = require('passport')
const express = require('express')
const session = require('express-session')
const nodemailer = require('nodemailer')
const LocalStrategy = require('passport-local').Strategy

const saltRounds = 12
const ivLength = 16
const tokenAlgorithm = 'aes-256-cbc'

module.exports = function ({ getHash, getEmail, mail, secret }) {
  const strategy = new LocalStrategy((username, password, callback) => {
    getHash(username)
      .then(hash => bcrypt.compare(password, hash))
      .then(isMatch => {
        if (isMatch) {
          return username
        } else {
          throw new Error('Password or username incorrect')
        }
      })
      .then(user => callback(null, user))
      .catch(error => callback(error))
  })

  passport.use(strategy)
  passport.serializeUser((username, callback) => callback(null, username))
  passport.deserializeUser((username, callback) => callback(null, username))

  function initialize () {
    return [
      cookieParser(),
      session({
        secret,
        resave: false,
        saveUninitialized: false
      }),
      passport.initialize(),
      passport.session()
    ]
  }

  function errorRedirect () {
    return (errorCode, req, res, next) => {
      const { errorRedirect, error } = req.query

      if (errorRedirect) {
        res.redirect(errorRedirect)
      } else if (!error) {
        res.redirect(url.format({
          pathname: req.path,
          query: Object.assign({ error: errorCode }, req.query)
        }))
      } else {
        next()
      }
    }
  }

  function successRedirect () {
    return (req, res, next) => {
      const { successRedirect, success } = req.query

      if (successRedirect) {
        res.redirect(successRedirect)
      } else if (!success) {
        res.redirect(url.format({
          pathname: req.path,
          query: Object.assign({ success: true }, req.query)
        }))
      } else {
        next()
      }
    }
  }

  function login ({ handleError, handleSuccess }) {
    return [
      bodyParser.urlencoded({ extended: false }),
      (req, res, next) => {
        if (!req.body.username || !req.body.password) {
          return handleError('missing-credentials', req, res, next)
        }

        passport.authenticate('local', (error, user) => {
          if (error) {
            return handleError('incorrect-credentials', req, res, next)
          }

          req.login(user, error => {
            if (error) {
              return handleError('login', req, res, next)
            }

            req.session.user = req.session.passport.user

            handleSuccess(req, res, next)
          })
        })(req, res, next)
      }
    ]
  }

  function logout ({ handleSuccess }) {
    return function (req, res, next) {
      if (req.session) {
        delete req.session.user
      }

      req.logout()

      handleSuccess(req, res, next)
    }
  }

  function requestToken ({ handleError, handleSuccess }) {
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

            const token = createToken(JSON.stringify({
              username: username,
              expires: Date.now() + 1000 * 60 * 60
            }), secret)

            return mail.templates.requestToken({
              token: token
            }).then(template => (
              sendMail(mail.smtp, Object.assign({ to: email }, template))
            )).then(info => {
              console.log('Message sent: %s', info.messageId)

              const previewUrl = nodemailer.getTestMessageUrl(info)

              if (previewUrl) {
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
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

  function validateToken ({ handleError, handleSuccess }) {
    return function (req, res, next) {
      if (req.query.token && !req.query.success && !req.query.error) {
        try {
          const { username, expires } = JSON.parse(readToken(req.query.token, secret))

          if (Date.now() < expires) {
            return req.login(username, error => {
              if (error) {
                return handleError('internal', req, res, next)
              }

              req.session.user = req.session.passport.user

              return handleSuccess(req, res, next)
            })
          } else {
            console.log('expired, handle error')
            return handleError('expired', req, res, next)
          }
        } catch (error) {
          return handleError('internal', req, res, next)
        }

        return handleError('internal', req, res, next)
      } else {
        next()
      }
    }
  }

  function api () {
    const router = express.Router()

    router.use(initialize())

    const defaultParams = {
      handleError: errorRedirect(),
      handleSuccess: successRedirect()
    }

    router.post('/login', login(defaultParams))
    router.post('/forgot-password', requestToken(defaultParams))
    router.get('/forgot-password', validateToken(defaultParams))
    router.get('/logout', logout(defaultParams))

    router.get('/session', (req, res, next) => {
      res.status(200).json(req.session)
    })

    return router
  }

  return {
    initialize,
    login,
    logout,
    requestToken,
    validateToken,
    api
  }
}

function sendMail (smtp, mail) {
  return getTransport(smtp).then(transport => transport.sendMail(mail))
}

function getTransport (smtp) {
  if (smtp) {
    return Promise.resolve(nodemailer.createTransport(smtp))
  }

  return nodemailer.createTestAccount().then(account => (
    nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: account.user,
        pass: account.pass
      }
    })
  ))
}

function createToken (text, secret) {
  const iv = crypto.randomBytes(ivLength)
  const cipher = crypto.createCipheriv(tokenAlgorithm, new Buffer(secret), iv)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

function readToken (text, secret) {
  const textParts = text.split(':')
  const iv = new Buffer(textParts.shift(), 'hex')
  const encryptedText = new Buffer(textParts.join(':'), 'hex')
  const decipher = crypto.createDecipheriv(tokenAlgorithm, new Buffer(secret), iv)
  let decrypted = decipher.update(encryptedText)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString()
}
