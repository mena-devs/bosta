const figlet = require('figlet')
const pre = require('../utils.js').pre
const match = require('@menadevs/objectron')

const verbose = `
How to use this plugin:

  figlet dany boy
`

function handleFiglet (message, groups) {
  figlet(groups.text, (err, data) => {
    if (!err) {
      message.reply_thread(pre(data))
    }
  })
}

const events = {
  message: (options, message) => {
    match(message, {
      type: 'message',
      text: /^figlet (?<text>.*)$/
    }, result => handleFiglet(message, result.groups))
  }
}

module.exports = {
  name: 'do_figlet',
  help: 'figlet-izes any text',
  verbose,
  events
}
