import express from 'express'
import client from './sanity/client'

const api = express.Router()

api.get('/page/:slug', (req, res) => {
  const query = `
    *[_type == "page" && slug.current == "${req.params.slug}"]
  `

  promiseResponse((
    client.fetch(query).then(result => result[0])
  ), req, res)
})

export default api

function promiseResponse (promise, req, res) {
  return promise
    .then(result => handleSuccess(result, req, res))
    .catch(error => handleError(error, req, res))
}

function handleSuccess (result, req, res) {
  res.status(200).json(result)
}

function handleError (error, req, res) {
  res.status(500).text(error.message)
}
