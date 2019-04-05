import { hydrate } from 'react-dom'
import queryString from 'query-string'
import router from '@cyberspace/router'
import createApiClient from '@cyberspace/api-client'
import routes from './routes'

const api = createApiClient('/api')()

api.hydrate(window.dehydrated)

router.listen(async (path, navigate) => {
  const query = queryString.parse(window.location.search)

  try {
    const { key, params } = router.resolve(routes, path)
    const route = await routes[key || '404']({ path, params, query, navigate, api })

    document.title = route.title

    await new Promise(resolve => {
      hydrate(route.component, document.getElementById('root'), resolve)
    })
  } catch (error) {
    console.log(error)
  }
})
