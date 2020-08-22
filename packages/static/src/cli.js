#!/usr/bin/env node

const args = process.argv.slice(2)
const command = args[0]

if (!command) {
  const package = require('../package')
  console.log(`${package.name} version ${package.version}`)
  console.log('Usage: static [command]')
  console.log('Commands:')
  console.log('  build')
  console.log('  serve')
  process.exit()
}

const options = {
  folder: process.cwd(),
  sitemap: args[1]
}

switch (command) {
  case 'build':
    return require('./build')(options)
  case 'serve':
    return require('./serve')(options)
}
