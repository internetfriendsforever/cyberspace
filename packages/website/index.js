const express = require('express')
const basicAuth = require('@cyberspace/basic-auth')
const s3 = require('@cyberspace/s3')

const app = express()

const auth = basicAuth({
  users: [{
    username: 'admin',
    password: 'secret'
  }]
})

const region = 'eu-west-1'
const bucket = 'cyberspace-website'

const storage = s3.storage({ bucket, region })
const database = s3.database({ bucket, region })

app.use('/api', auth, storage, database)

app.get('/', (req, res) => {
  res.status(200).send('Public cyberspace website!')
})

app.listen(3000)
