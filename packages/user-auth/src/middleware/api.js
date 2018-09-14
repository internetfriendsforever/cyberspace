const express = require('express')
const initialize = require('./initialize')
const login = require('./login')
const logout = require('./logout')
const validateToken = require('./validateToken')
const requestToken = require('./requestToken')
const changePassword = require('./changePassword')
const redirectError = require('./redirectError')
const redirectSuccess = require('./redirectSuccess')

module.exports = function api ({ secret, getHash, setHash, getEmail, smtp, templates = {} }) {
  const router = express.Router()

  router.use(initialize({
    secret
  }))

  const handleError = redirectError()
  const handleSuccess = redirectSuccess()

  router.post('/login', login({
    getHash,
    handleError,
    handleSuccess
  }))

  router.get('/logout', logout({
    handleError,
    handleSuccess
  }))

  router.post('/forgot-password', requestToken({
    secret,
    getEmail,
    handleError,
    handleSuccess,
    smtp,
    template: templates.requestToken
  }))

  router.get('/forgot-password', validateToken({
    secret,
    handleError,
    handleSuccess
  }))

  router.post('/change-password', changePassword({
    getHash,
    setHash,
    handleError,
    handleSuccess
  }))

  router.get('/authenticated', (req, res, next) => {
    res.status(200).json(!!req.session.user)
  })

  return router
}
