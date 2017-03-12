const https = require('https');

const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

const winston = require('winston');

const storage = require('node-persist');

const META = {
    name: 'newuser',
    short: 'Greets new users and sends them a copy of the code of conduct',
    examples: [
        'when a user joins #general they will be greeted privately',
    ],
};

// TODO :: Move this URL to the configuration file
const cocURL = 'https://raw.githubusercontent.com/mena-devs/code-of-conduct/master/GREETING.md';

/**
 * Takes the UserList (Semi-Column sepearated String)
 * prepends a newUser to the list and maintains a maximum number of items
 * returns the new string for storage
 *
 * @param {[type]} userList [description]
 * @param {[type]} maxItems [description]
 * @param {[type]} newUser  [description]
 *
 * @return {[type]} [description]
 */
function prependUser(userList, maxItems, newUser) {
    // -1 cause Arrays in JS start from the 0 index
    if (countMembers(userList) < maxItems-1) {
        // This crap is because unshift returns the length of the new array
        // Go figure..
        userList = userList.split(';');
        userList.unshift(newUser);
        return userList.join(';');
    } else {
        userList = userList.split(';').slice(0, maxItems-1);
        userList.unshift(newUser);
        return userList.join(';');
    }
}

/**
 * Takes a ';' separated value list and counts the number of entries in it
 *
 * @param {[type]} userList [description]
 *
 * @return {[type]} [description]
 */
function countMembers(userList) {
    return userList.split(';').length;
}

/**
 * Retrieve the list of all recently joined users in storage
 * These are stored in 'data/recent_members'
 *
 * @param {[type]} config  [description]
 * @param {[type]} storage [description]
 *
 * @return {[type]} [description]
 */
function getAllUsers(config, storage) {
    return new Promise((resolve, reject) => {
        storage.getItem('recent_users')
        .then((value) => resolve(value));
    });
}

/**
 * Retrieve the list of all the users in storage
 * if empty, populate it with the first entry
 * if not, append to the list the new entry
 * up to a maximum of 10 entries
 *
 * @param {[type]} config    [description]
 * @param {[type]} newUserID [description]
 *
 * @return {[type]} [description]
 */
function storeNewMember(config, newUserID) {
    // Get the total number of users to store from the configuration
    const maxRecentUsers = config.plugins.newuser.max_recent_users;
    storage.init({
        dir: config.plugins.system.recent_members_path,
    })
    .then(() => getAllUsers(config, storage))
    .then((users) => {
        if (!users) {
            storage.setItem('recent_users', newUserID)
            .then(() => winston.info(`Added ${newUserID} to storage!`));
        } else {
            // Append new user ID
            const userList = prependUser(users, maxRecentUsers, newUserID);
            storage.setItem('recent_users', userList)
            .then(() => getAllUsers(config, storage))
            .then((users) => {
                console.log(users, countMembers(users));
                winston.info('Recent members list updated!')
            });
        }
    });
}

/**
 * Retrieves user information from ID
 * TODO: Move it to utils.js
 *
 * @param {[type]} bot [description]
 * @param {[type]} id  [description]
 *
 * @return {String} Username associated the ID provided
 */
function findUser(web, id) {
    return new Promise((resolve, reject) => {
        // Send a private message to the user with the CoC
        web.users.info(id, (err, res) => {
            if (err) {
                reject(`I don't know of a ${id}`);
            } else {
                resolve(res.user.name);
            }
        });
    });
}

/**
 * Retrieve the CoC from the github URL
 *
 * @return {[type]} [description]
 */
function retrieveCoC() {
    return new Promise((resolve, reject) => {
        https.get(cocURL, (res) => {
            // Combine the chunks that are retrieved
            const responseParts = [];
            res.setEncoding('utf8');
            res.on('data', (d) => {
                responseParts.push(d);
            });
            // Combine the chunks and resolve
            res.on('end', () => {
                resolve(responseParts.join(''));
            });
        }).on('error', (e) => {
            reject(`Could not retrieve CoC ${e}`);
        });
    });
}

/**
 * Send a private message to a user
 *
 * @param {[type]} web      [description]
 * @param {[type]} receiver [description]
 * @param {[type]} message  [description]
 *
 * @return {[type]} [description]
 */
function postMessage(web, receiver, message) {
    return new Promise((resolve, reject) => {
        // Send a private message to the user with the CoC
        const msg = `Hi <@${receiver}>! \n\
I'm *Bostantine Androidaou* MENA Dev's butler. I'm at your service, all you \
gotta do is to call \`@bosta help\`. In the meantime, here's a message \
from the admins: \n\n ${message}`;
        web.chat.postMessage(receiver, msg, { as_user: true }, (err) => {
            if (err) {
                reject(`Welcome message could not be sent: ${err}`);
            } else {
                resolve(receiver);
            }
        });
    });
}

/**
 * Main
 *
 * @param {[type]} bot    [description]
 * @param {[type]} rtm    [description]
 * @param {[type]} web    [description]
 * @param {[type]} config [description]
 *
 * @return {[type]} [description]
 */
function register(bot, rtm, web, config) {
    rtm.on(RTM_EVENTS.MESSAGE, (message) => {
        if (message.subtype === 'channel_join'
                && message.channel === config.main.general_chan_id) {
            web.reactions.add('wave',
                { channel: message.channel, timestamp: message.ts })
                .catch(error => winston.error(error));

            retrieveCoC()
                .then(data => postMessage(web, message.user, data))
                .then(user => {
                    storeNewMember(config, user);
                    winston.info(`Sent greeting to: <@${user}>`)
                })
                .catch(error => winston.error(error));
        }

        // Manual greet
        if (message.text) {
            const pattern = /<@([^>]+)>:? greet <@([^>]+)>:?/;
            const [, target, userId] = message.text.match(pattern) || [];
            const user = { id: userId, name: '' };

            if (target === bot.self.id) {
                findUser(web, user.id)
                    .then((response) => { user.name = response; })
                    .then(() => retrieveCoC())
                    .then(data => postMessage(web, user.id, data))
                    .then((userRId) => {
                        storeNewMember(config, userRId);
                        winston.info(`Sent greeting to: <@${userRId}>`)
                    })
                    .catch(error => winston.error(error));
            }
        }
    });
}

module.exports = {
    register,
    META,
};
