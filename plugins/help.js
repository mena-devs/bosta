const path = require('path')
const match = require('@menadevs/objectron')

const config = require('../config.js')
const {
  Blocks,
  Section,
  Markdown
} = require('../blocks.js')

const help = 'help plugin allows you, get help!'

const plugins = config.plugins.filter(p => !p.includes('help.js')).map(p => {
  const plugin = require(path.resolve(p))
  return [plugin.name, plugin.help]
}).concat([['help', help]])

var buildBlocks = (plugin) => {
  const helps = plugins.filter(p => {
    // Fugly! => if a plugin was passed, filter, otherwise return all.
    return plugin ? plugin === p[0] : true
  }).map(([name, helpText]) => {
    return `*${name}:* ${helpText}`
  })

  if (helps.length === 0) {
    return Blocks(Section(Markdown(`No such plugin: *${plugin}*`)))
  } else {
    return Blocks(Section(Markdown(helps.join('\n'))))
  }
}

module.exports = {
  name: 'help',
  help,
  events: {
    message: (options, message) => {
      match(message, {
        type: 'message',
        text: /^help$/
      }, result => options.web.chat.postMessage({
        channel: message.channel,
        blocks: buildBlocks(),
        as_user: true
      }))

      match(message, {
        type: 'message',
        text: /^help (?<plugin>.*)/
      }, result => {
        options.web.chat.postMessage({
          channel: message.channel,
          blocks: buildBlocks(result.groups.plugin),
          as_user: true
        })
      })
    }
  }
}
