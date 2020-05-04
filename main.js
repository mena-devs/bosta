const path = require('path')

const { createServer } = require('http')
const express = require('express')

const { WebClient } = require('@slack/web-api')
const { createEventAdapter } = require('@slack/events-api')
const { createMessageAdapter } = require('@slack/interactive-messages')

const { logger } = require('./logging.js')
const secret = require('./secret.json')
const config = require('./config.js')
const utils = require('./utils.js')

const eventsAdapter = createEventAdapter(process.env.SLACK_SIGNING_SECRET)
const interactionsAdapter = createMessageAdapter(process.env.SLACK_SIGNING_SECRET)
const web = new WebClient(secret.token)

config.plugins.forEach(pluginPath => {
  const filename = path.resolve(pluginPath)

  // Needed, otherwise it'll load from cache
  delete require.cache[filename]

  const module = require(filename)

  Object.entries(module.events).forEach(([name, func]) => {
    const listener = (payload) => func({ logger, web }, utils.patch(web, payload))
    eventsAdapter.on(name, listener)
  })

  if (module.actions) {
    const actions = (payload, respond) => module.actions({ logger, web }, payload, respond)
    interactionsAdapter.action({}, actions)
  }

  if ('init' in module) {
    module.init({ logger, web })
  }
})

const app = express()
app.use('/slack/events', eventsAdapter.requestListener())
app.use('/slack/interactive', interactionsAdapter.requestListener())

const server = createServer(app)
const port = process.env.PORT || 3000
server.listen(port, () => {
  console.log(`Listening for events on ${server.address().port}`)
})
