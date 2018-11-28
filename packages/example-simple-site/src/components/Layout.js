import React, { Fragment } from 'react'
import { injectGlobal } from 'emotion'
import Navigation from './Navigation'

injectGlobal`
  * {
    box-sizing: border-box;
  }

  body {
    background: lightyellow;
  }
`

export default function Layout ({ path, user, site, children }) {
  return (
    <Fragment>
      <Navigation site={site} path={path} />

      {children}
    </Fragment>
  )
}
