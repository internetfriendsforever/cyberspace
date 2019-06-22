module.exports = ({ statusCode = 200, title, body }) => ({
  statusCode,
  headers: {
    'Content-Type': 'text/html'
  },
  body: `
    <!doctype html>
    <html>
      <head>
        <title>${title}</title>
        <link rel="shortcut icon" href="/static/favicon.png" />
        <link rel="stylesheet" href="/static/styles.css" />
      </head>
      <body>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/about">About</a></li>
        </ul>

        ${body}
      </body>
    </html>
  `
})
