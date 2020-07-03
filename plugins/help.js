const path = require('path')
const match = require('@menadevs/objectron')

const config = require('../config.js')
const {
  Blocks,
  Button,
  Divider,
  Markdown,
  Section
} = require('../blocks.js')

const help = 'get help!'
const verbose = `
How use this plugin:
    help
`

const plugins = Object.fromEntries(
  config.plugins.filter(
    p => !p.includes('help.js')
  ).map(p => {
    const plugin = require(path.resolve(p))
    return [plugin.name, plugin]
  }).concat([['help', { name: 'help', help, verbose }]])
)

const buildBlocks = () => {
  const helps = Object.values(plugins).map((plugin) => Section(
    Markdown(`*${plugin.name}:* ${plugin.help}`),
    Button('Learn more', `help ${plugin.name}`)
  ))

  return Blocks(...helps)
}

const buildHelpBlocks = (plugin) => {
  const selected = plugins[plugin]
  return Blocks(
    Section(Markdown(`*${selected.name}:* ${selected.help}\n${selected.verbose}`)),
    Divider()
  )
}

module.exports = {
  name: 'help',
  help,
  verbose,

  actions: (options, payload, respond) => {
    match(payload, {
      type: 'block_actions',
      actions: [{
        value: /help (?<module>.*)/
      }]
    }, result => {
      options.web.chat.postMessage({
        channel: payload.user.id,
        blocks: buildHelpBlocks(result.groups.module),
        as_user: true
      })
    })
  },

  events: {
    message: (options, message) => {
      match(message, {
        type: 'message',
        text: /^help$/
      }, result => {
        options.web.chat.postMessage({
          channel: message.channel,
          blocks: buildBlocks(),
          as_user: true
        })
      })
    }
  }
}
