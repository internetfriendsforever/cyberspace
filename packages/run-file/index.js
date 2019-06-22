const fs = require('fs')
const path = require('path')
const mime = require('mime')

module.exports = file => {
  const filepath = path.resolve(process.cwd(), file)

  if (fs.existsSync(filepath)) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': mime.getType(filepath) },
      body: fs.readFileSync(filepath).toString('base64'),
      isBase64Encoded: true
    }
  }

  return {
    statusCode: 404,
    headers: { 'Content-Type': 'text/plain' },
    body: `File not found: ${file}`
  }
}
