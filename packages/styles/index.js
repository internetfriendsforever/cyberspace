import stylis from 'stylis'

const Style = function (input) {
  this.input = input
  this.hash = hash(input)
  this.name = 'css' + this.hash
  this.className = '.' + this.name
  this.id = 'style' + this.hash
  this.css = stylis(this.className, input)
}

Style.prototype.toString = function () {
  return this.name
}

Style.prototype.hash = function () {
  if (this.input.length === 0) {
    return 0
  }

  let hash
  let chr

  for (let i = 0; i < this.input.length; i++) {
    chr = this.input.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0
  }

  return hash
}

function hash (string) {
  if (string.length === 0) {
    return 0
  }

  let hash
  let chr

  for (let i = 0; i < string.length; i++) {
    chr = string.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0
  }

  return hash
}

const Styles = function () {
  this.styles = {}
}

Styles.prototype.add = function () {
  const args = Array.prototype.slice.call(arguments)

  const inputs = []

  for (let i in args) {
    const arg = args[i]

    if (arg) {
      if (typeof arg === 'string') {
        inputs.push(arg)
      } else if (arg instanceof Style) {
        inputs.push(arg.input)
      }
    }
  }

  const style = new Style(inputs.join('\n'))

  this.styles[style.id] = style

  return style
}

Styles.prototype.toString = function () {
  const css = []

  for (let key in this.styles) {
    css.push(this.styles[key].css)
  }

  return css.join('\n')
}

export default Styles
