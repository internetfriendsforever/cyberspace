import { hydrate } from 'react-dom'
import router from '@cyberspace/router'
import routes from './routes'

router.start((path = window.location.pathname) => {
  const { title, component } = router.resolve(routes, path, window.data)
  document.title = title
  hydrate(component, document.getElementById('root'))
})
