import React, { Fragment } from 'react'
import Navigation from './Navigation'

export default function Page ({ children }) {
  return (
    <Fragment>
      <Navigation />
      {children}
    </Fragment>
  )
}
