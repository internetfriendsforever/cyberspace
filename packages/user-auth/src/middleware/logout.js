module.exports = function logout ({ handleSuccess }) {
  return function (req, res, next) {
    if (req.session) {
      delete req.session.user
    }

    handleSuccess(req, res, next)
  }
}
