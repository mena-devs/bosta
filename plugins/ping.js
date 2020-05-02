const match = require('@menadevs/objectron')

const verbose = `
How to use this plugin:

    ping
    ping john
`

module.exports = {
  name: 'ping',
  help: 'see if the bot is alive, or ask it to ping others',
  verbose,
  events: {
    message: (options, message) => {
      match(message, {
        type: 'message',
        text: /^ping$/
      }, result => message.reply('pong'))

      match(message, {
        type: 'message',
        text: /^ping (?<who>.*)/
      }, result => message.reply(`${result.groups.who} wake up!`))
    }
  }
}
