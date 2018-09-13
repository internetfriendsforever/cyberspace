const url = require('url')
const bcrypt = require('bcrypt')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const passport = require('passport')
const express = require('express')
const session = require('express-session')
const LocalStrategy = require('passport-local').Strategy

const saltRounds = 12

module.exports = function ({
  getPasswordHash,
  getUserEmail
}) {
  const strategy = new LocalStrategy((username, password, callback) => {
    getPasswordHash(username)
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
        secret: 'n0rs4kjetrr5evarer',
        resave: false,
        saveUninitialized: false
      }),
      passport.initialize(),
      passport.session()
    ]
  }

  function errorRedirect () {
    return (error, req, res) => {
      res.redirect(req.query.errorRedirect || url.format({
        pathname: req.path,
        query: Object.assign({ error }, req.query)
      }))
    }
  }

  function successRedirect () {
    return (req, res) => {
      res.redirect(req.query.successRedirect || url.format({
        pathname: req.path,
        query: Object.assign({ success: true }, req.query)
      }))
    }
  }

  function login (handleError = errorRedirect()) {
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

            next()
          })
        })(req, res, next)
      }
    ]
  }

  function logout () {
    return function (req, res, next) {
      if (req.session) {
        delete req.session.user
      }

      req.logout()

      next()
    }
  }

  function forgotPassword (handleError = errorRedirect()) {
    return [
      bodyParser.urlencoded({ extended: false }),
      (req, res, next) => {
        getUserEmail(req.body.username)
          .then(email => {
            if (!email) {
              return handleError('no-user', req, res, next)
            }

            console.log('TODO: Send email to', email)

            next()
          })
          .catch(error => {
            return handleError('internal', req, res, next)
          })
      }
    ]
  }

  function api () {
    const router = express.Router()

    router.use(initialize())
    router.post('/login', login(), successRedirect())
    router.post('/forgot-password', forgotPassword(), successRedirect())
    router.get('/logout', logout())
    router.get('/session', (req, res, next) => {
      res.status(200).json(req.session)
    })

    return router
  }

  return {
    initialize,
    login,
    logout,
    api
  }
}
