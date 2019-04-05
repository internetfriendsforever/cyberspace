import fs from 'fs'
import path from 'path'
import express from 'express'
import router from '@cyberspace/router'
import createApiClient from '@cyberspace/api-client'
import { renderToString } from 'react-dom/server'
import { renderStylesToString } from 'emotion-server'
import apiMiddleware from './api'
import routes from './routes'
import favicon from './assets/favicon.png'

const app = express()

const port = 3001
const url = process.env.NOW_URL || `http://localhost:${port}`
const apiPath = '/api'
const apiUrl = `${url}${apiPath}`
const apiClient = createApiClient(apiUrl)

app.use('/static', express.static(path.join(__dirname, 'static'), {
  immutable: true,
  maxAge: '1y'
}))

const client = fs.readFileSync(path.join(__dirname, 'scripts/client'))

app.use(apiPath, apiMiddleware)

app.use('/invalidate', (req, res) => {
  apiClient.flush()
  res.status(200).end()
})

app.use(async (req, res) => {
  try {
    const { path, query } = req
    const { key, params } = router.resolve(routes, path)
    const navigate = path => res.redirect(path)
    const route = await routes[key || '404']({ path, params, query, navigate, api: apiClient })

    if (!res.headersSent) {
      res.status(route.statusCode || 200).send(`
        <!doctype html>
        <html lang='no'>
          <head>
            <title>${route.title}</title>
            <meta charset='utf-8' />
            <meta name='viewport' content='width=device-width, initial-scale=1' />
            <meta name='theme-color' content='#000' />
            <link rel='icon' type='image/png' href='${favicon}'>
            <script src="https://cdn.polyfill.io/v2/polyfill.min.js"></script>
          </head>
          <body>
            <div id='root'>${renderStylesToString(renderToString(route.component))}</div>
            <script>window.dehydrated = ${apiClient.dehydrate()};</script>
            <script src='/${client}'></script>
          </body>
        </html>
      `)
    }
  } catch (error) {
    res.status(500).send(`Server error: ${error}`)
  }
})

app.listen(port, () => {
  console.log('Server listening at port', port)
})
