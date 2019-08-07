const CloudFront = require('aws-sdk/clients/cloudfront')

const cloudfront = new CloudFront({
  region: process.env.REGION
})

module.exports = {
  async invalidate (paths = ['/*'], { wait = false } = {}) {
    const data = await cloudfront.createInvalidation({
      DistributionId: process.env.DISTRIBUTION,
      InvalidationBatch: {
        CallerReference: new Date().getTime().toString(),
        Paths: {
          Quantity: paths.length,
          Items: paths
        }
      }
    }).promise()

    if (wait) {
      await cloudfront.waitFor('invalidationCompleted', {
        DistributionId: process.env.DISTRIBUTION,
        Id: data.Invalidation.Id
      }).promise()
    }
  }
}
