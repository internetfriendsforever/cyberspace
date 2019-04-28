import express from 'express'
import bundle from '@cyberspace/webpack-config/bundle'
import router from '@cyberspace/router'
import { renderToString } from 'react-dom/server'
import { renderStylesToString } from 'emotion-server'
import routes from './routes'
import favicon from './assets/favicon.png'

const app = express()

const port = 3001

app.use('/static', bundle)

app.use(async (req, res) => {
  try {
    const { path, query } = req
    const { key, params } = router.resolve(routes, path)
    const navigate = path => res.redirect(path)
    const route = await routes[key || '404']({ path, params, query, navigate })

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
