const S3 = require('aws-sdk/clients/s3')

const s3 = new S3({
  region: process.env.REGION
})

const objectParams = key => ({
  Bucket: process.env.BUCKET,
  Key: `storage/${key}`
})

module.exports = {
  async get (key) {
    try {
      const params = objectParams(key)
      const data = await s3.getObject(params).promise()

      return data.Body.toString()
    } catch (error) {
      if (error.code === 'NoSuchKey') {
        return null
      } else {
        throw error
      }
    }
  },

  async put (key, body) {
    const params = objectParams(key)

    params.Body = body

    await s3.putObject(params).promise()
  }
}
