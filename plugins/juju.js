const match = require('@menadevs/objectron')

const verbose = `
How to use this plugin:

    is using linux bad juju?
    is hugging toni bad juju?
`

module.exports = {
  name: 'juju',
  help: 'what is bad juju?',
  verbose,
  events: {
    message: (options, message) => {
      match(message, {
        type: 'message',
        text: /^is (?<verb>\S+) (?<what>\S+) bad juju?/
      }, result => message.reply(
                `${result.groups.what} is bad juju, people have died ${result.groups.verb} ${result.groups.what}`
      ))
    }
  }
}
