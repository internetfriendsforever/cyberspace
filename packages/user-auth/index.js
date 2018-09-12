const bcrypt = require('bcrypt')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const passport = require('passport')
const express = require('express')
const session = require('express-session')
const LocalStrategy = require('passport-local').Strategy

const saltRounds = 10

module.exports = function ({
  getUser,
  getPasswordHash,
  serializeUser,
  deserializeUser
}) {
  const strategy = new LocalStrategy((username, password, callback) => {
    getPasswordHash(username)
      .then(hash => bcrypt.compare(password, hash))
      .then(isMatch => {
        if (isMatch) {
          return getUser(username)
        } else {
          throw new Error('Password incorrect')
        }
      })
      .then(user => callback(null, user))
      .catch(error => callback(error))
  })

  passport.use(strategy)

  passport.serializeUser((user, callback) => {
    serializeUser(user)
      .then(serialized => callback(null, serialized))
      .catch(error => callback(error))
  })

  passport.deserializeUser((serialized, callback) => {
    deserializeUser(serialized)
      .then(user => callback(null, user))
      .catch(error => callback(error))
  })

  const initialize = () => [
    cookieParser(),
    session({
      secret: 'n0rs4kjetrr5evarer',
      resave: false,
      saveUninitialized: false
    }),
    passport.initialize(),
    passport.session()
  ]

  const onFailDefault = (req, res) => {
    res.redirect('/login')
  }

  const login = (onFail = onFailDefault) => [
    bodyParser.urlencoded({ extended: false }),
    (req, res, next) => {
      passport.authenticate('local', (error, user) => {
        delete req.session.loginError

        if (error) {
          req.session.loginError = { message: error.message }
          return onFail(req, res, next)
        }

        req.login(user, error => {
          if (error) {
            req.session.loginError = { message: error.message }
            return onFail(req, res, next)
          }

          next()
        })
      })(req, res, next)
    }
  ]

  const logout = () => (req, res, next) => {
    req.logout()
    next()
  }

  const required = (onFail = onFailDefault) => (req, res, next) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
      next()
    } else {
      onFail(req, res, next)
    }
  }

  const api = () => {
    const router = express.Router()

    router.use(initialize())

    router.post('/login', login(), (req, res) => {
      res.redirect(req.body.redirectTo || '/')
    })

    router.get('/logout', logout())

    router.get('/authenticate', required(), (req, res) => {
      res.status(200).end()
    })

    router.get('/session', (req, res, next) => {
      res.status(200).json(req.session)
    })

    return router
  }

  return {
    initialize,
    login,
    logout,
    required,
    api
  }
}
