import React from 'react'
import Page from './components/Page'
import Home from './pages/Home'
import About from './pages/About'
import Category from './pages/Category'
import Login from './pages/Login'
import Logout from './pages/Logout'
import ForgotPassword from './pages/ForgotPassword'
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

  '/about': ({ params }) => ({
    title: 'About',
    authRequired: true,
    component: (
      <Page>
        <About />
      </Page>
    )
  }),

  '/category/:slug': ({ params }) => ({
    title: `Category: ${params.slug}`,
    component: (
      <Page>
        <Category slug={params.slug} />
      </Page>
    )
  }),

  '/login': ({ query, navigate }) => ({
    title: `Login`,
    component: (
      <Page>
        <Login query={query} navigate={navigate} />
      </Page>
    )
  }),

  '/logout': ({ params, session, navigate }) => ({
    title: `Login`,
    component: (
      <Page>
        <Logout user={session.user} navigate={navigate} />
      </Page>
    )
  }),

  '/forgot-password': ({ query, navigate }) => ({
    title: 'Forgot password',
    component: (
      <Page>
        <ForgotPassword query={query} navigate={navigate} />
      </Page>
    )
  }),

  '/profile': ({ params }) => ({
    title: `Profile`,
    authRequired: true,
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
