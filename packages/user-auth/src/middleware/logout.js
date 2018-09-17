module.exports = function logout ({ handleSuccess }) {
  return function (req, res, next) {
    if (req.session) {
      delete req.session.user
      delete req.session.authentication
    }

    handleSuccess(req, res, next)
  }
}
