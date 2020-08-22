#!/usr/bin/env node

const path = require('path')
const minimist = require('minimist')

const argv = minimist(process.argv.slice(2))
const command = argv._ && argv._[0]

if (!command || argv.help) {
  require('./help')()
  process.exit()
}

const input = {
  folder: argv.folder || argv.f || '.',
  output: argv.output || argv.o || 'build',
  config: argv.config || argv.c || 'build.config.js'
}

const paths = {
  output: path.resolve(input.folder, input.output),
  config: path.resolve(input.folder, input.config)
}

switch (command) {
  case 'build':
    return require('./build')({ paths })
  case 'serve':
    return require('./serve')({ paths })
}
