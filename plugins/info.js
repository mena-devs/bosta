const match = require('@menadevs/objectron')
const os = require('os')
const config = require('../config.js')
const {
  Blocks,
  Section,
  Fields,
  Context,
  Divider,
  PlainText,
  Markdown
} = require('../blocks.js')

var buildBlocks = (team, name, prefix, host) => {
  const plugins = config.plugins.map((plugin) => {
    return PlainText(plugin)
  })

  return Blocks(
    Section(
      Fields(
        Markdown(`*Team:* ${team}`),
        Markdown(`*Prefix*: ${prefix}`),
        Markdown(`*Name*: ${name}`),
        Markdown(`*Host*: ${host}`)
      )
    ),
    Divider(),
    Section(
      Fields(...plugins)
    ),
    Divider(),
    Context(
      Markdown(`Booted on: ${new Date()}`)
    )
  )
}

const verbose = `
How to use this plugin:

    bot info
`

module.exports = {
  name: 'info',
  help: 'bot information plugin',
  verbose,

  events: {
    message: (options, message) => {
      match(message, {
        type: 'message',
        text: /^bot info$/
      }, result => (async () => {
        const teamPayload = await options.web.team.info()

        options.web.chat.postMessage({
          as_user: true,
          channel: message.channel,
          blocks: buildBlocks(
            teamPayload.team.name,
            'Bosta', // Where the hell do we get this from?
            config.main.prefix,
            os.hostname()
          )
        })
      })())
    }
  }
}
