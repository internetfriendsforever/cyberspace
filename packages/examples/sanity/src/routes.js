import React from 'react'
import Layout from './components/Layout'
import Page from './pages/Page'
import NotFound from './pages/NotFound'

const site = {
  name: 'Jack’s Wooly Jumpers Limited'
}

export default {
  '/': ({ path }) => {
    return {
      title: `${site.name}`,
      component: (
        <Layout path={path}>
          <h1>Home of {site.name}</h1>
        </Layout>
      )
    }
  },

  '/about': ({ path }) => {
    return {
      title: `About – ${site.name}`,
      component: (
        <Layout path={path}>
          <h1>About Jack’s Wooly Jumpers</h1>
        </Layout>
      )
    }
  },

  '/sweaters': async ({ api, path }) => {
    const page = await api.get(`/page/sweaters`)

    return {
      title: `${page.title} – ${site.name}`,
      component: (
        <Layout path={path}>
          <Page page={page} />
        </Layout>
      )
    }
  },

  '404': async ({ api }) => ({
    statusCode: 404,
    title: 'Not found',
    component: (
      <Layout>
        <NotFound />
      </Layout>
    )
  })
}
