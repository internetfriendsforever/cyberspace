import React from 'react'

export default function Navigation () {
  return (
    <nav>
      <ul>
        <li><a href='/'>Home</a></li>
        <li><a href='/about'>About</a></li>
        <li><a href='/about' target='_blank'>About blank</a></li>
      </ul>
    </nav>
  )
}
