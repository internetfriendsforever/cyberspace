const url = require('url')

module.exports = function redirectSuccess (req, res, next) {
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
