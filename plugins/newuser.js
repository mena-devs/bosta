const https = require('https');

const request = require('request');

const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

const storage = require('node-persist');

const winston = require('winston');

const META = {
    name: 'newuser',
    short: 'Greets new users and sends them a copy of the code of conduct',
    examples: [
        '@bosta greet @Username',
    ],
};

const COCURL = 'https://raw.githubusercontent.com/mena-devs/code-of-conduct/master/README.md';

/**
 * Retrieves user information from ID
 * TODO -- Move to utils.js
 *
 * @param {[type]} bot [description]
 * @param {[type]} id  [description]
 *
 * @return {[type]} [description]
 */
function findUser(bot, id) {
    return new Promise((resolve, reject) => {
        const members = bot.users.filter(m => m.id === id);

        if (members.length !== 1) {
            reject(`I don't know of a ${id}`);
        } else {
            resolve([members[0].name, members[0].id]);
        }
    });
}

/**
 * Retrieve the CoC from the github URL
 *
 * @return {[type]} [description]
 */
function retrieveCoC() {
    return new Promise((resolve, reject) => {
        https.get(COCURL, (res) => {
            res.on('data', (d) => {
                resolve(d);
            });
        }).on('error', (e) => {
            reject(e);
        });
    });
}

function register(bot, rtm, web, config) {
    rtm.on(RTM_EVENTS.MESSAGE, (message) => {
        if (message.text) {
            const pattern = /<@([^>]+)>:? greet <@([^>]+)>:?/;
            const [, target, userId] = message.text.match(pattern) || [];

            if (target === bot.self.id) {
                findUser(bot, userId)
                    .then((user) => {
                        rtm.sendMessage(`Welcome on-board ${user[0]} glad to have you here`, message.channel);
                        // Send the user the CoC
                        retrieveCoC()
                            .then(data => {
                                // Send a private message to the user with the CoC
                                web.chat.postMessage(user[1], `\`\`\`${data}\`\`\``, {
                                    as_user: true
                                }, function(err, res) {
                                    if (err) {
                                        console.log('Error:', err);
                                    } else {
                                        console.log('Message sent: ', res);
                                    }
                                });
                            });
                    });
            }
        }
    });
}


module.exports = {
    register,
    META,
};
