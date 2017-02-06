const https = require('https');

const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

const winston = require('winston');

const META = {
    name: 'newuser',
    short: 'Greets new users and sends them a copy of the code of conduct',
    examples: [
        'when a user joins #general they will be greeted privately',
    ],
};

const cocURL = 'https://raw.githubusercontent.com/mena-devs/code-of-conduct/master/GREETING.md';

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
            reject(e);
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
                && message.channel === config.main.default_chan_id) {
            web.reactions.add('wave',
                { channel: message.channel, timestamp: message.ts })
                .catch(error => winston.error(error));

            retrieveCoC()
                .then(data => postMessage(web, message.user, data))
                .then(user => winston.info(`sent greeting to: <@${user}>`))
                .catch(error => winston.error(error));
        }
    });
}

module.exports = {
    register,
    META,
};
