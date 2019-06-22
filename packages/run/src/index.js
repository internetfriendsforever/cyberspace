#!/usr/bin/env node

const args = process.argv.slice(2)
const command = args[0]

const projectPath = process.cwd()

switch (command) {
  case 'start':
    require('./start')({
      projectPath
    })
    break
  case 'deploy':
    require('./deploy')({
      hostname: args[1],
      projectPath
    })
    break
  default:
    console.log([
      'Usage: aws-website [command]',
      '',
      'Commands:',
      'start (Start local development server)',
      'deploy [hostname] (Deploy website to AWS)'
    ].join('\n'))
    break
}
