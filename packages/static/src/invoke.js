const path = require('path')

const args = process.argv.slice(2)
const sitemap = require(args[0])
const url = args[1]

if (url) {
  if (url in sitemap) {
    invoke(url)
  } else {
    process.send({
      missing: true
    })
  }
} else {
  Object.keys(sitemap).forEach(invoke)
}

function invoke (url) {
  const result = sitemap[url]()

  if (result && result.readable) {
    const data = []

    result.on('data', chunk => {
      data.push(chunk)
    })

    result.on('end', () => {
      process.send({
        url,
        body: Buffer.concat(data).toString()
      })
    })
  } else {
    process.send({
      url,
      body: result
    })
  }
}
