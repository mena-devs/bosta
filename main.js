const path = require('path')

const { createServer } = require('http')
const express = require('express')

const { WebClient } = require('@slack/web-api')
const { createEventAdapter } = require('@slack/events-api')

const { logger } = require('./logging.js')
const secret = require('./secret.json')
const config = require('./config.js')
const utils = require('./utils.js')

const adapter = createEventAdapter(process.env.SLACK_SIGNING_SECRET)
const web = new WebClient(secret.token)

config.plugins.forEach(pluginPath => {
  const filename = path.resolve(pluginPath)

  // Needed, otherwise it'll load from cache
  delete require.cache[filename]

  const module = require(filename)
  const pluginEvents = module.events
  const listeners = {}

  Object.entries(pluginEvents).forEach(([name, func]) => {
    const listener = (payload) => func({ logger, web }, utils.patch(web, payload))

    adapter.on(name, listener)
    listeners[name] = listener
  })

  module.listeners = listeners

  if ('init' in module) {
    module.init({ logger, web })
  }

  return module
})

const app = express()
app.use('/slack/events', adapter.requestListener())

const server = createServer(app)
const port = process.env.PORT || 3000
server.listen(port, () => {
  console.log(`Listening for events on ${server.address().port}`)
})
