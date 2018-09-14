const crypto = require('crypto')

const ivLength = 16
const tokenAlgorithm = 'aes-256-cbc'

function create (text, secret) {
  const iv = crypto.randomBytes(ivLength)
  const cipher = crypto.createCipheriv(tokenAlgorithm, new Buffer(secret), iv)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

function read (text, secret) {
  const textParts = text.split(':')
  const iv = new Buffer(textParts.shift(), 'hex')
  const encryptedText = new Buffer(textParts.join(':'), 'hex')
  const decipher = crypto.createDecipheriv(tokenAlgorithm, new Buffer(secret), iv)
  let decrypted = decipher.update(encryptedText)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString()
}

module.exports = {
  create,
  read
}
