import express from 'express'
import bundle from '@cyberspace/webpack-config/bundle'
import router from '@cyberspace/router'
import createApiClientCache from '@cyberspace/api-client'
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
const createApiClient = createApiClientCache(apiUrl)

app.use((req, res, next) => {
  res.locals.api = createApiClient()
  next()
})

app.use('/static', bundle)

app.use(apiPath, apiMiddleware)

app.use('/invalidate', (req, res) => {
  res.locals.api.flush()
  res.status(200).end()
})

app.use(async (req, res) => {
  try {
    const { api } = res.locals
    const { path, query } = req
    const { key, params } = router.resolve(routes, path)
    const navigate = path => res.redirect(path)
    const route = await routes[key || '404']({ path, params, query, navigate, api })

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
            <script>window.dehydrated = ${api.dehydrate()};</script>
            <script src='/static/client.js'></script>
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
