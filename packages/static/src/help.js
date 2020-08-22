const package = require('../package')

module.exports = () => console.log(`
${package.name} version ${package.version}

Commands:
  build
  serve

Options:
  Option:       Description:    Default:
  --folder, -f  Project folder  current working directory
  --output, -o  Output folder   build
  --config, -c  Config file     build.config.js

Examples:
  static serve
  static build
  static build --output=public --config=build.js
  static serve --folder=/usr/home/User/Desktop/Project
`.trim())
