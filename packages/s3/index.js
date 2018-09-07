const express = require('express')
const bodyParser = require('body-parser')
const S3 = require('aws-sdk/clients/s3')

const middleware = path => ({ region, bucket }) => {
  const api = express.Router()

  const s3 = new S3({ region })

  api.get(`/${path}/:key`, (req, res) => {
    s3.getObject({
      Bucket: bucket,
      Key: `${path}/${req.params.key}`
    }).promise().then(data => {
      res.status(200).set('Content-Type', data.ContentType).send(data.Body)
    }).catch(error => {
      res.status(error.statusCode).send(error.message)
    })
  })

  api.put(`/${path}/:key`, bodyParser.raw({ type: '*/*' }), (req, res) => {
    s3.putObject({
      Bucket: bucket,
      Key: `${path}/${req.params.key}`,
      Body: req.body,
      ContentType: req.get('Content-Type')
    }).promise().then(data => {
      res.status(200).send(data.Body)
    }).catch(error => {
      res.status(error.statusCode || 500).send(error.message)
    })
  })

  return api
}

module.exports = {
  storage: middleware('storage'),
  database: middleware('database')
}
