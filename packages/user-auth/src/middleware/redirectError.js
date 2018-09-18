const url = require('url')

module.exports = function redirectError (errorCode, req, res, next) {
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
