#!/usr/bin/env node

const exec = require('child_process').exec
const path = require('path')
const minimist = require('minimist')
const webpack = require('webpack')
const WebpackBar = require('webpackbar')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')

const argv = minimist(process.argv.slice(2))

const config = require(path.resolve(argv.config || 'webpack.config.js'))

function extend (config, i) {
  config.mode = 'development'

  if (!config.plugins) {
    config.plugins = []
  }

  config.plugins.push(new WebpackBar({
    name: config.name || i
  }))

  config.plugins.push(new FriendlyErrorsWebpackPlugin())
}

if (Array.isArray(config)) {
  config.forEach(extend)
} else {
  extend(config)
}

const compiler = webpack(config)

let childProcess

compiler.watch(null, (error, result) => {
  killChildProcess()

  if (error || result.hasErrors()) {
    console.log('Has errors. Not starting child process')
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
  console.log('Starting child process \'' + command + '\'...')
}

function killChildProcess () {
  if (childProcess) {
    console.log('Killing process...')
    childProcess.kill()
  }
}

process.on('exit', () => {
  killChildProcess()
})
