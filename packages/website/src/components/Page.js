import React from 'react'
import styled from 'react-emotion'
import Navigation from './Navigation'

const Container = styled('div')`
  padding: 1em;
  border: 1px black solid;
`

export default function Page ({ children }) {
  return (
    <Container>
      <Navigation />
      {children}
    </Container>
  )
}
