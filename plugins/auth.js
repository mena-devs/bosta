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
      Markdown(`*Team:* ${team}\n*Name*: ${name}\n*Prefix*: ${prefix}\n*Host*: ${host}`)
    ),
    Divider(),
    Section(
      Markdown('*Installed Plugins*'),
      Fields(...plugins)
    ),
    Divider(),
    Context(
      Markdown('Locked and Loaded')
    )
  )
}

const verbose = `
How to use this plugin:

    You don't ;-)
`

module.exports = {
  name: 'auth',
  help: 'authentication plugin, logs auth sequence to channel',
  verbose,

  events: {
    authenticated: (options, payload) => {
      options.web.chat.postMessage({
        channel: config.main.logging.channel,
        blocks: buildBlocks(
          payload.team.name,
          payload.self.name,
          config.main.prefix,
          os.hostname()
        )
      })
    }
  }
}
