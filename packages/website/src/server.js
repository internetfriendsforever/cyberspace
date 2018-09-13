import fs from 'fs'
import path from 'path'
import express from 'express'
import basicAuth from '@cyberspace/basic-auth'
import userAuth from '@cyberspace/user-auth'
import s3 from '@cyberspace/s3'
import router from '@cyberspace/router'
import { renderToString } from 'react-dom/server'
import { renderStylesToString } from 'emotion-server'
import routes from './routes'
import favicon from './assets/favicon.png'
import styles from './styles.css'

const app = express()

const getUser = async username => ({
  username: 'daniel'
})

const auth = userAuth({
  getUser: getUser,

  getPasswordHash: async username => (
    '$2b$10$svkH.JkbqtjIfcwaYDWgGu8JS5HFsUjcNduOY9AkJEjEWjFMsnmum'
  ),

  serializeUser: async user => user.username,
  deserializeUser: getUser
})

app.use(auth.api())

app.use('/static', express.static(path.join(__dirname, 'static'), {
  immutable: true,
  maxAge: '1y'
}))

app.use('/secret', basicAuth({
  users: [{
    username: 'admin',
    password: 'secret'
  }]
}), (req, res) => {
  res.status(200).send('Secret page')
})

const client = fs.readFileSync(path.join(__dirname, 'scripts/client'))

app.use((req, res) => {
  const { session, query } = req
  const { key, params } = router.resolve(routes, req.path)
  const route = routes[key || '404']({ params, session, query })

  if (route.authRequired && !session.user) {
    return res.redirect(`/login?redirectTo=${req.path}`)
  }

  res.status(route.statusCode || 200).send(`
    <!doctype html>
    <html lang='en'>
      <head>
        <title>${route.title}</title>
        <meta charset='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='stylesheet' href='${styles}' />
        <link rel='icon' type='image/png' href='${favicon}'>
      </head>
      <body>
        <div id='root'>${renderStylesToString(renderToString(route.component))}</div>
        <script src='/${client}'></script>
      </body>
    </html>
  `)
})

const port = 3000

app.listen(port, () => {
  console.log('Server listening at port', port)
})
