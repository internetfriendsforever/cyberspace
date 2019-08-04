const styles = require('./index.cjs.js')

const header = styles.add(`
  font-size: 2em;
  color: pink;
`)

const blueHeader = styles.add(header, `color: blue`)

console.log(styles.toString())
