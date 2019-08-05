import React, { Fragment } from 'react'
import Navigation from './Navigation'

export default function Layout ({ path, site, children }) {
  return (
    <Fragment>
      <Navigation site={site} path={path} />

      {children}
    </Fragment>
  )
}
