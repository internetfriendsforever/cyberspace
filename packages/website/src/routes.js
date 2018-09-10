import React from 'react'
import Page from './components/Page'
import Home from './pages/Home'
import About from './pages/About'
import Category from './pages/Category'
import NotFound from './pages/NotFound'

export default {
  '/': () => ({
    title: 'Home',
    component: (
      <Page>
        <Home />
      </Page>
    )
  }),

  '/about': (params, data) => ({
    title: 'About',
    component: (
      <Page>
        <About data={data} />
      </Page>
    )
  }),

  '/category/:slug': (params) => ({
    title: `Category: ${params.slug}`,
    component: (
      <Page>
        <Category slug={params.slug} />
      </Page>
    )
  }),

  '404': () => ({
    statusCode: 404,
    title: 'Not found',
    component: (
      <Page>
        <NotFound />
      </Page>
    )
  })
}
