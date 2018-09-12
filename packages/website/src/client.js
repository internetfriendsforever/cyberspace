import { hydrate } from 'react-dom'
import router from '@cyberspace/router'
import routes from './routes'

router.start((path = window.location.pathname) => {
  window.fetch('/session').then(res => res.json()).then(session => {
    const { title, component } = router.resolve(routes, path, session)
    document.title = title
    hydrate(component, document.getElementById('root'))
  })
})
