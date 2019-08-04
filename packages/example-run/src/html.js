const pretty = require('pretty')
const styles = require('@cyberspace/styles')

const css = {
  body: styles.add(`
    background: lightyellow;
  `)
}

module.exports = ({ statusCode = 200, title, body }) => ({
  statusCode,
  headers: {
    'Content-Type': 'text/html'
  },
  body: pretty(`
    <!doctype html>
    <html>
      <head>
        <title>${title}</title>
        <link rel="shortcut icon" href="/static/favicon.png" />
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body class="${css.body}">
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/about">About</a></li>
        </ul>

        ${body}
      </body>
    </html>
  `, {
    ocd: true
  })
})
