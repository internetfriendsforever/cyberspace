import React from 'react'
import Page from './components/Page'
import Home from './pages/Home'
import About from './pages/About'
import Category from './pages/Category'
import Login from './pages/Login'
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

  '/about': params => ({
    title: 'About',
    component: (
      <Page>
        <About />
      </Page>
    )
  }),

  '/category/:slug': params => ({
    title: `Category: ${params.slug}`,
    component: (
      <Page>
        <Category slug={params.slug} />
      </Page>
    )
  }),

  '/login': (params, session = {}) => ({
    title: `Login`,
    component: (
      <Page>
        {JSON.stringify(session)}
        <Login error={session.loginError} />
      </Page>
    )
  }),

  '/logout': params => ({
    title: `Login`,
    component: (
      <Page>
        You are logged out
      </Page>
    )
  }),

  '/profile': params => ({
    title: `Profile`,
    component: (
      <Page>
        <div>User profile</div>
        <a href='/logout'>Logout</a>
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
