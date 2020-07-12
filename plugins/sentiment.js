const winston = require('winston')
const fetch = require('node-fetch')
const { URLSearchParams } = require('url')
const match = require('@menadevs/objectron')
const { pre } = require('../utils.js')
const secret = require('../secret.json')

const verbose = `
How to use this pluginL

  analyse jordan
`

/**
 * find the user based on the passed name and return the first one found
 * returns undefined if no user was found
 * @param {*} users
 * @param {*} name
 */
async function findUser (users, name) {
  const { members } = await users.list()

  return members.filter(member => member.profile.display_name.toLowerCase() === name.toLowerCase())[0]
}

/**
 * find the channel or group in the list of workspace channels/groups
 * returns undefined if the channel/group didn't match
 * @param {*} conversations (could be a channel, a group or an im)
 * @param {*} channel
 */
async function getTargetChannel (conversations, channel) {
  const { channels } = await conversations.list()

  return channels.filter(c => c.id === channel && c.is_archived === false)[0]
}

/**
 * get the user messages in the last 100 messages in the provided channel
 * @param {*} channel
 * @param {*} user
 */
async function getUserMessagesInChannel (conversations, channel, user) {
  const { messages } = await conversations.history({ channel: channel.id, limit: 1000 })
  const lastTenMessagesByUser = messages.filter(message => message.user === user.id).slice(0, 10)

  return lastTenMessagesByUser
}

/**
 * Send the messages to the api and return response
 * @param {*} secret
 * @param {*} messages
 */
async function analyseSentiment (messages) {
  const params = new URLSearchParams()
  params.set('api_key', secret.datumbox)
  params.append('text', messages)
  const response = await fetch('http://api.datumbox.com/1.0/SentimentAnalysis.json', { method: 'POST', body: params })
  const jsonResult = await response.json()
  return jsonResult
}

async function analyse (options, message, target) {
  try {
    const user = await findUser(options.web.users, target)
    if (!user) {
      message.reply_thread(`I don't know of a ${target}. Please validate you entered the correct person's name.`)
      return
    }

    const targetChannel = await getTargetChannel(options.web.conversations, message.channel)
    if (!targetChannel) {
      message.reply_thread('Are you in a channel or group? sentiment doesn\'t work in a direct message')
      return
    }

    const messages = await getUserMessagesInChannel(options.web.conversations, targetChannel, user)
    if (messages.length !== 0) {
      const response = await analyseSentiment(messages.map(m => m.text).join('\n'))
      message.reply_thread(`${target} has recently been ${response.output.result}`)
    } else {
      message.reply_thread(`'User ${target} has not spoken recently'`)
    }
  } catch (error) {
    console.error(error)
    message.reply_thread(`Something went wrong! this has nothing to do with the sentiments of ${target}. Please check the logs.`)
    options.logger.error(`${module.exports.name} - something went wrong. Here's the error: ${pre(error)}`)
  }
}

const events = {
  message: (options, message) => {
    match(message, {
      type: 'message',
      text: /^analyse (?<name>.+)/
    }, result => analyse(options, message, result.groups.name))
  }
}

module.exports = {
  name: 'sentiment',
  help: 'provides a sentiment analysis on the last 10 messages of a user',
  verbose,
  events,
  findUser,
  getTargetChannel,
  getUserMessagesInChannel,
  analyseSentiment,
  analyse
}
