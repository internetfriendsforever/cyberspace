import React, { Fragment } from 'react'

export default function Page ({ page }) {
  const { title, text } = page

  return (
    <Fragment>
      <h1>{title}</h1>
      <p>{text}</p>
    </Fragment>
  )
}
