const express = require('express')
const initialize = require('./initialize')
const login = require('./login')
const logout = require('./logout')
const validateToken = require('./validateToken')
const requestToken = require('./requestToken')
const changePassword = require('./changePassword')
const redirectError = require('./redirectError')
const redirectSuccess = require('./redirectSuccess')

module.exports = function api ({ secret, getHash, setHash, getEmail, smtp, ...options }) {
  const endpoints = Object.assign({
    login: '/login',
    logout: '/logout',
    forgotPassword: '/forgot-password',
    changePassword: '/change-password',
    authenticated: '/authenticated'
  }, options.endpoints)

  const templates = Object.assign({
    requestToken: async ({ query }) => ({
      from: '[from]',
      subject: '[subject]',
      text: `[url]${query}`,
      html: `<a href='[url]${query}'>this link</a>`
    })
  }, options.templates)

  const router = express.Router()

  router.use(initialize({
    secret
  }))

  const handleError = redirectError()
  const handleSuccess = redirectSuccess()

  router.post(endpoints.login, login({
    getHash,
    handleError,
    handleSuccess
  }))

  router.get(endpoints.logout, logout({
    handleError,
    handleSuccess
  }))

  router.post(endpoints.forgotPassword, requestToken({
    secret,
    getEmail,
    handleError,
    handleSuccess,
    smtp,
    template: templates.requestToken
  }))

  router.get(endpoints.forgotPassword, validateToken({
    secret,
    handleError,
    handleSuccess
  }))

  router.post(endpoints.changePassword, changePassword({
    getHash,
    setHash,
    handleError,
    handleSuccess
  }))

  router.get(endpoints.authenticated, (req, res, next) => {
    res.status(200).json(!!req.session.user)
  })

  return router
}
