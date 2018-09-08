#!/usr/bin/env node

const exec = require('child_process').exec
const path = require('path')
const minimist = require('minimist')
const webpack = require('webpack')

const argv = minimist(process.argv.slice(2))

const config = require(path.resolve(argv.config || 'webpack.config.js'))

console.log(config)

if (Array.isArray(config)) {
  config.forEach(config => {
    config.mode = 'development'
  })
} else {
  config.mode = 'development'
}

const compiler = webpack(config)

let childProcess

compiler.watch(null, (error, result) => {
  killChildProcess()

  if (error) {
    console.log(error)
  }

  console.log(result.toString({
    colors: true,
    modules: false
  }))

  if (result.hasErrors()) {
    console.log('Has errors ignoring exec...')
  } else {
    if (argv.exec) {
      startChildProcess(argv.exec)
    }
  }
})

function startChildProcess (command) {
  childProcess = exec(command)
  childProcess.stdout.on('data', (data) => console.log(data.toString()))
  childProcess.stderr.on('data', (data) => console.error(data.toString()))
  console.log('Started process:', childProcess.pid)
}

function killChildProcess () {
  if (childProcess) {
    console.log('Killing process:', childProcess.pid)
    childProcess.kill()
  }
}

process.on('exit', () => {
  killChildProcess()
})
