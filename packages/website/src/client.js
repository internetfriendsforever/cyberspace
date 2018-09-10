import router from '@cyberspace/router'
import routes from './routes'

router.start((path = window.location.pathname) => {
  const { title, html } = router.resolve(routes, path, window.data)
  document.title = title
  document.body.innerHTML = html
})
