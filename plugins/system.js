const cp = require('child_process')
const https = require('https')
const winston = require('winston')
const storage = require('node-persist')
const Plugin = require('../utils.js').Plugin
const RTM_EVENTS = require('@slack/client').RTM_EVENTS

const pre = require('../utils.js').pre

const META = {
  name: 'system',
  short: 'Execute system calls to manage Bosta',
  examples: [
    '@bosta respawn',
    '@bosta uptime',
    '@bosta recents',
    '@bosta coc'
  ]
}

// TODO :: Move this URL to the configuration file
const cocURL = 'https://raw.githubusercontent.com/mena-devs/code-of-conduct/master/README.md'

function retrieveCoC () {
  return new Promise((resolve, reject) => {
    https.get(cocURL, (res) => {
      // Combine the chunks that are retrieved
      const responseParts = []
      res.setEncoding('utf8')
      res.on('data', (d) => {
        responseParts.push(d)
      })
      // Combine the chunks and resolve
      res.on('end', () => {
        resolve(responseParts.join(''))
      })
    }).on('error', (e) => {
      reject(`Could not retrieve CoC ${e}`)
    })
  })
}

function coc (options, message, who) {
  retrieveCoC()
    .then((data) => {
      message.reply(pre(data))
    })
    .catch(error => winston.error(`Could not post CoC: ${error}`))
}

function recents (options, message, who) {
  storage.init({ dir: options.config.plugins.system.recent_members_path })
    .then(() => storage.getItem(options.config.plugins.system.recent_members_key))
    .then((users) => {
      if (users) {
        const recentIds = users.split(';')
        const formattedIds = recentIds.map(id => `<@${id}>`).join(' ')
        message.reply(`There you go: ${formattedIds}`)
      } else {
        winston.info('Have not been keeping track of new users')
        message.reply('Sorry, I haven\'t been keeping track...')
      }
    })
    .catch(error => winston.error(`Could not retrieve recent users: ${error}`))
}

function respawn (options, message, who) {
  message.reply(`<@${message.user}> ordered a respawn! :thinking_face:`)

  // Execute the reboot order with 'forever'
  // This cannot be an async call
  cp.exec('forever restart main.js', (error) => {
    if (error) {
      message.reply('Looks like that reboot isn\'t gonna happen today :grin:')
      winston.error(`Could not execute reboot: ${error}`)
    }
  })
}

function uptime (options, message, who) {
  message.reply('Hold on a sec :thinking_face:')

  // Retrieve the uptime
  cp.exec('forever list --plain', (error, stdout) => {
    if (error) {
      winston.error(`Could not execute your order: ${error}`)
    } else {
      message.reply(`There you go: \n ${pre(stdout)}`)
    }
  })
}

function register (bot, rtm, web, config) {
  const plugin = new Plugin({ bot, rtm, web, config })
  plugin.route(/<@([^>]+)>:? respawn/, respawn, { self: true })
  plugin.route(/<@([^>]+)>:? uptime/, uptime, { self: true })
  plugin.route(/<@([^>]+)>:? recents/, recents, { self: true })
  plugin.route(/<@([^>]+)>:? coc/, coc, { self: true })
}

module.exports = {
  register,
  META
}
