export default {
  '/': () => ({
    title: 'Home',
    html: 'Home page'
  }),

  '/about': (params, data) => ({
    title: 'About',
    html: `About with data: <pre>${JSON.stringify(data, null, 2)}</pre>`
  }),

  '/categories/:slug': (params) => ({
    title: `Category: ${params.slug}`,
    html: `Category: ${params.slug}`
  }),

  '404': () => ({
    statusCode: 404,
    title: 'Not found',
    html: 'Page not found'
  })
}
