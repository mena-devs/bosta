const storage = require('node-persist')
const match = require('@menadevs/objectron')
const config = require('../config')

const verbose = `
How to use this plugin:

    +5 @jason
    -5 @jason
    karma @jason
`

function updateKarma (message, groups, options, proceedure) {
  // console.log(proceedure);
  // Deny user from adding Karma to himself
  if (message.user === groups.user) {
    message.reply_thread('You cannot give or take karma to/from yourself')
    return
  }

  storage.init({ dir: config.karma.karma_log })
    .then(() => storage.getItem(groups.user))
    .then((currentKarma) => {
      // Update the Karma for the receiver
      let totalKarma = Number.parseInt(groups.points, 10)

      if (proceedure === 'increment') {
        if (currentKarma) {
          totalKarma += Number.parseInt(currentKarma, 10)
        }
      } else if (proceedure === 'decrement') {
        if (!currentKarma) {
          message.reply_thread(`<@${groups.user}> has no Karma to deduct from!`)
        } else {
          totalKarma = Number.parseInt(currentKarma, 10) - totalKarma
        }
      }

      storage.setItem(groups.user, totalKarma)

      /**
       * react to the message as an acknowledgment
       * since array is 0 indexed, we'll use points -1
       * example:
       *  +3 @username
       *  will use numbersName[2]
       */
      const emoji = ['one', 'two', 'three', 'four', 'five']
      message.react(emoji[groups.points - 1])
    })
    .then(() => storage.getItem(message.user))
    .then((requesterKarma) => {
      /**
       * In case of a Karma decrease remove 2 karma points
       * from the requester. This has the ability to reduce
       * a user's Karma to a negative value
       */
      if (proceedure === 'decrement') {
        let totalKarma = -2
        if (requesterKarma) {
          totalKarma = Number.parseInt(requesterKarma, 10) - 2
        }

        storage.setItem(message.user, totalKarma)
        message.reply_thread(`2 karma points have been take from you as well <@${message.user}>. Your new balance is: ${totalKarma}`)
      }
    })
}

function getKarma (message, groups, options) {
  return storage.init({ dir: config.karma.karma_log })
    .then(() => storage.getItem(groups.user))
    .then((currentKarma) => {
      if (!currentKarma) {
        currentKarma = 0
      }
      message.reply_thread(`<@${groups.user}>'s karma: ${currentKarma}`)
    }).catch(error => options.logger.error(`${module.exports.name}: ${error}`))
}

const events = {
  message: (options, message) => {
    match(message, {
      type: 'message',
      text: /^\+(?<points>[1-5]) <@(?<user>[^>]+)>:?/
    }, result => updateKarma(message, result.groups, options, 'increment'))

    match(message, {
      type: 'message',
      text: /^\-(?<points>[1-5]) <@(?<user>[^>]+)>:?/
    }, result => updateKarma(message, result.groups, options, 'decrement'))

    match(message, {
      type: 'message',
      text: /^karma <@(?<user>[^>]+)>:?/
    }, result => getKarma(message, result.groups, options))
  }
}

module.exports = {
  name: 'karma',
  help: 'Give or deducte someone\'s karma points. Remember that if you deduct, 2 karma points will be taken from you as a penalty!',
  verbose,
  events
}
