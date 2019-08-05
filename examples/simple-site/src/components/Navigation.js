import React from 'react'
import styles from '@cyberspace/styles'

const css = {
  list: styles.add(`
    list-style: none;
    margin: 0;
    padding: 0;
  `),

  item: styles.add(`
    margin: 0;

    a {
      text-decoration: none;
      color: black;

      :hover {
        color: red;
      }
    }
  `)
}

export default function Navigation () {
  return (
    <nav>
      <ul className={css.list}>
        <li className={css.item}><a href='/'>Home</a></li>
        <li className={css.item}><a href='/about'>About</a></li>
        <li className={css.item}><a href='/about' target='_blank'>About blank</a></li>
      </ul>
    </nav>
  )
}
