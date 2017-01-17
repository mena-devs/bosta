const https = require('https');

const request = require('request');

const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

const winston = require('winston');

const META = {
    name: 'newuser',
    short: 'Greets new users and sends them a copy of the code of conduct',
    examples: [
        '@bosta greet @Username',
    ],
};

const cocURL = 'https://raw.githubusercontent.com/mena-devs/code-of-conduct/master/GREETING.md';

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
        https.get(cocURL, (res) => {
            // Combine the chunks that are retrieved
            var responseParts = [];
            res.setEncoding('utf8');
            res.on('data', (d) => {
                responseParts.push(d);
            });
            // Combine the chunks and resolve
            res.on('end', () => {
                resolve(responseParts.join(''));
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
                                // user[1] refers to User ID
                                web.chat.postMessage(user[1], `Hi ${user[0]}! \n${data}`, {
                                    as_user: true
                                }, function(err, res) {
                                    if (err) {
                                        winston.error('Error:', err);
                                    } else {
                                        winston.info('Message sent!');
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
