const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')

const storageDir = path.join(process.env.LOCAL_ROOT, '.storage')

if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir)
}

module.exports = {
  get (key) {
    const filename = path.join(storageDir, key)

    if (fs.existsSync(filename)) {
      return fs.promises.readFile(filename)
    } else {
      return null
    }
  },

  async put (key, body) {
    const filename = path.join(storageDir, key)
    const dirname = path.dirname(filename)

    await new Promise((resolve, reject) => {
      mkdirp(dirname, (error) => {
        if (error) {
          reject(error)
        } else {
          resolve()
        }
      })
    })

    return fs.promises.writeFile(filename, body)
  }
}
