const match = require('@menadevs/objectron')
const { pre } = require('../utils.js')

const figlet = require('figlet')

const verbose = `
How to use this plugin:
    figlet dany boy
`

module.exports = {
  name: 'figlet',
  help: 'figletizes text',
  verbose,
  events: {
    message: (options, message) => {
      match(message, {
        type: 'message',
        text: /^figlet (?<what>.*)/
      }, result => figlet(result.groups.what, (err, data) => {
        if (!err) {
          message.reply_thread(pre(data))
        }
      }))
    }
  }
}
