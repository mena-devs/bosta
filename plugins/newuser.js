const config = require('../config');
const rp = require('request-promise');
const storage = require('node-persist');
const match = require('@menadevs/objectron');

const verbose = '';

const mainChannel = process.env.DEBUG
  ? config.main.bot_test_channel_id
  : config.main.general_channel_id;

/**
 * Retrieve the CoC from the github URL
 */
function retrieveCoC() {
  const request = {
    url: config.newuser.coc_url
  };

  return rp(request);
}

/**
 * Send a private message to a user
 *
 * @param {*} options
 * @param {*} recipientId
 * @param {*} message
 */
function privateMessage(options, recipientId, message) {
  // Send a private message to the user with the CoC
  const messageBody = `Hi <@${recipientId}>! \n\
I'm *Bostantine Androidaou* MENA Dev's butler. I'm at your service, all you \
gotta do is to call \`@bosta help\`. In the meantime, here's a message \
from the admins: \n\n ${message}`;

  return options.web.chat.postMessage({
    channel: recipientId,
    text: messageBody,
    as_user: true
  });
}

/**
 * Add new joiner to the list of recent joiners
 *
 * @param {*} options
 * @param {*} userId
 */
function addUserToRecentsList(options, userId) {
  return storage
    .init({ dir: config.newuser.recent_users_store })
    .then(() => storage.getItem('list'))
    .then((recentUsersList) => {
      // If the item doesn't exist already, create it
      if (!recentUsersList) {
        recentUsersList = [];
      }
      // Make sure there are no duplicate users in the list
      // extreme edge case
      if (!recentUsersList.includes(userId)) {
        recentUsersList.push(userId);
        // Store only up to N number of users defined in max_recent_users variable
        // slice(-N) will guarantee that only the latest N users are returned
        // from the array for storage
        storage.setItem(
          'list',
          recentUsersList.slice(-config.newuser.max_recent_users)
        );
      }
    });
}

/**
 * - Add a 'wave' emoji when a new member joins the #general
 * - Fetch the code of conduct and send it in a private message to the member
 * - Store the user in a list of recent joiners
 *
 * @param {*} message
 * @param {*} groups
 * @param {*} options
 */
function greetUser(message, groups, options) {
  // Only trigger if the user joins #general
  if (groups.channelId === mainChannel) {
    // Add a wave emoji as a general greeting
    options.web.reactions
      .add({
        name: 'wave',
        channel: groups.channelId,
        timestamp: message.ts
      })
      .then((response) => {
        // Fetch the CoC text so that it can be sent as a private
        // message to new joiners
        return process.env.DEBUG ? null : retrieveCoC();
      })
      .then((cocBody) => {
        // Send the CoC as a private message to the new joiner
        return process.env.DEBUG
          ? null
          : privateMessage(options, groups.userId, cocBody);
      })
      .then(() => {
        // Store new user in the recent users list
        return addUserToRecentsList(options, groups.userId);
      })
      .catch((error) =>
        options.logger.error(`${module.exports.name}: ${error}`)
      );
  }
}

const events = {
  message: (options, message) => {
    match(
      message,
      {
        type: 'message',
        subtype: 'channel_join',
        user: /(?<userId>.*)/,
        channel: /(?<channelId>.*)/
      },
      (result) => greetUser(message, result.groups, options)
    );
  }
};

module.exports = {
  name: 'newuser',
  help: 'Greets new users and sends them a copy of the code of conduct',
  verbose,
  events
};
