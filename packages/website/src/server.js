import fs from 'fs'
import path from 'path'
import express from 'express'
import basicAuth from '@cyberspace/basic-auth'
import s3 from '@cyberspace/s3'

const app = express()

const auth = basicAuth({
  users: [{
    username: 'admin',
    password: 'secret'
  }]
})

const region = 'eu-west-1'
const bucket = 'cyberspace-website'

app.use('/api',
  auth,
  s3.storage({ bucket, region }),
  s3.database({ bucket, region })
)

app.use('/static', express.static(path.join(__dirname, 'static'), {
  immutable: true,
  maxAge: '1y'
}))

const client = fs.readFileSync(path.join(__dirname, 'scripts/client'))

app.get('/', (req, res) => {
  res.status(200).send(`
    <!doctype html>
    <html lang='en'>
      <head>
        <title>Page title</title>
        <meta charset='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' type='image/png' href='' />
      </head>
      <body>
        Hello World!
        <script src='/${client}'></script>
      </body>
    </html>
  `)
})

const port = 3000

app.listen(port, () => {
  console.log('Server listening at port', port)
})
