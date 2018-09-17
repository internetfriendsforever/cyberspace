import { hydrate } from 'react-dom'
import queryString from 'query-string'
import router from '@cyberspace/router'
import routes from './routes'

const navigate = router.listen((path = window.location.pathname) => {
  window.fetch('/authentication').then(res => res.json()).then(authentication => {
    const query = queryString.parse(window.location.search)
    const { key, params } = router.resolve(routes, path)
    const route = routes[key || '404']({ params, authentication, query, navigate })

    if (route.authRequired && !authentication) {
      return navigate(`/login?successRedirect=${window.location.pathname}`, { replace: true })
    }

    document.title = route.title

    hydrate(route.component, document.getElementById('root'))
  })
})
