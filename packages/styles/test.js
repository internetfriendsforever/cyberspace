const Styles = require('./dist/cjs')

const styles = new Styles()

const header = styles.add(`
  font-size: 2em;
  color: pink;
`)

console.log(header)

const blueHeader = styles.add(header, `color: blue`)

console.log(styles.toString())
