exports.handler = async (event, context) => ({
  statusCode: 200,
  headers: { 'Content-Type': 'text/plain' },
  body: [
    'This is a @cyberspace/run example returning a plain text response',
    'Event:',
    JSON.stringify(event, null, 2),
    'Context:',
    JSON.stringify(context, null, 2)
  ].join('\n\n')
})
