import { hydrate } from 'react-dom'
import queryString from 'query-string'
import router from '@cyberspace/router'
import routes from './routes'

router.listen(async (path, navigate) => {
  const query = queryString.parse(window.location.search)

  try {
    const { key, params } = router.resolve(routes, path)
    const route = await routes[key || '404']({ path, params, query, navigate })
    document.title = route.title
    hydrate(route.component, document.getElementById('root'))
  } catch (error) {
    console.log(error)
  }
})
