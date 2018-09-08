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

app.get('/', (req, res) => {
  res.status(200).send('Public cyberspace website!')
})

const port = 3000

app.listen(port, () => {
  console.log('Server listening at port', port)
})
