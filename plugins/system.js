const cp = require('child_process')
const config = require('../config')
const pre = require('../utils.js').pre
const storage = require('node-persist')
const match = require('@menadevs/objectron')

const verbose = `
How to use this plugin:

    .respawn
    .uptime
    .recents
`

/**
 * Reboots Bosta in case of a major failure. Bosta has to be responsive for this
 * command to function.
 *
 * @param {*} message
 * @param {*} options
 */
function executeRespawn(message, options) {
  message.reply(`<@${message.user}> ordered a respawn! :thinking_face:`)

  // Execute the reboot order with 'forever'
  // This cannot be an async call
  cp.exec('forever restart main.js', (error) => {
    if (error) {
      message.reply('Looks like that reboot isn\'t gonna happen today :sob: :hankey: code maybe?')
      options.logger.error(`${module.exports.name}: could not execute the reboot ${pre(error)}`)
    }
  })
}

/**
 * Fetch the uptime of Bosta process on the server. We use forver to manage the 
 * process so we can fetch uptime from it.
 *
 * This will throw an error if you're running bosta locally without using
 * forever or without having forever installed.
 *
 * @param {*} message
 * @param {*} options
 */
function getUptime(message, options) {
  cp.exec('forever list --plain', (error, stdout) => {
    if (error) {
      options.logger.error(`${module.exports.name}: uptime could not be fetched. ${pre(error)}`)
    } else {
      message.reply(pre(stdout))
    }
  })
}

/**
 * Fetch list of most recently joined users and post a message
 * in a thread for the requesting user
 *
 * @param {*} message
 * @param {*} options
 */
function getRecentsList(message, options) {
  return storage.init({ dir: config.newuser.recent_users_store })
    .then(() => storage.getItem('list'))
    .then((recentUsersList) => {
      if (!recentUsersList) {
        return message.reply_thread('Recents list is empty.')
      } else {
        // Transforms an array ["U03E0JTTH","U03CY39KX"] to a string like:
        // <@U03E0JTTH> <@U03CY39KX>
        const wrappedUsersList = recentUsersList.map(id => `<@${id}>`).join(' ')
        const usersCount = recentUsersList.length
        return message.reply_thread(`Here are the ${usersCount} most recently joined members: ${wrappedUsersList}`)
      }
    })
    .catch(error => options.logger.error(`${module.exports.name}: ${pre(error)}`))
}

const events = {
  message: (options, message) => {
    match(message, {
      type: 'message',
      text: /^.recents$/
    }, result => getRecentsList(message, options))

    match(message, {
      type: 'message',
      text: /^.uptime$/
    }, result => getUptime(message, options))

    match(message, {
      type: 'message',
      text: /^.respawn$/
    }, result => executeRespawn(message, options))
  }
}

module.exports = {
  name: 'system',
  help: 'Execute system calls to manage Bosta',
  verbose,
  events
}
