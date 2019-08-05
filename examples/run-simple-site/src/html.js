const pretty = require('pretty')
const styles = require('@cyberspace/styles')

const css = {
  body: styles.add(`
    background: lightyellow;
  `),

  nav: styles.add(`
    margin-bottom: 1em;
  `)
}

module.exports = ({
  path,
  statusCode = 200,
  title,
  content
}) => ({
  statusCode,
  headers: { 'Content-Type': 'text/html' },
  body: pretty(`
    <!doctype html>
    <html>
      <head>
        <title>${title} – @cyberspace/run simple site example</title>
        <meta charset="utf-8" />
        <link rel="shortcut icon" href="/assets/favicon.png" />
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body class="${css.body}">
        <nav class="${css.nav}">
          <a href="/">Home</a>
          <a href="/about">About</a>
        </nav>

        ${content}
      </body>
    </html>
  `, {
    ocd: true
  })
})
