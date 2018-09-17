import React from 'react'
import Page from './components/Page'
import Home from './pages/Home'
import About from './pages/About'
import Category from './pages/Category'
import Login from './pages/Login'
import Logout from './pages/Logout'
import ForgotPassword from './pages/ForgotPassword'
import ChangePassword from './pages/ChangePassword'
import Profile from './pages/Profile'
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

  '/logout': ({ params, authentication, navigate }) => ({
    title: `Logout`,
    component: (
      <Page>
        <Logout authentication={authentication} navigate={navigate} />
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

  '/change-password': ({ query, authentication, navigate }) => ({
    title: 'Forgot password',
    authRequired: true,
    component: (
      <Page>
        <ChangePassword authentication={authentication} query={query} navigate={navigate} />
      </Page>
    )
  }),

  '/profile': () => ({
    title: `Profile`,
    authRequired: true,
    component: (
      <Page>
        <Profile />
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
