import React, { Fragment } from 'react'

export default function Profile () {
  return (
    <Fragment>
      <h2>User profile</h2>
      <ul>
        <li><a href='/change-password'>Change password</a></li>
        <li><a href='/logout'>Logout</a></li>
      </ul>
    </Fragment>
  )
}
