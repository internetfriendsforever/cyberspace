import React, { Fragment } from 'react'
import Navigation from './Navigation'

export default function Layout ({ path, user, site, children }) {
  return (
    <Fragment>
      <Navigation site={site} path={path} />

      {children}
    </Fragment>
  )
}
