const nodemailer = require('nodemailer')

function send (smtp, mail) {
  return getTransport(smtp)
    .then(transport => transport.sendMail(mail))
    .then(info => {
      const result = {
        id: info.messageId
      }

      if (!smtp) {
        result.previewUrl = nodemailer.getTestMessageUrl(info)
      }

      return result
    })
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

module.exports = {
  send
}
