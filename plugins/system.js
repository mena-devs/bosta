const cp = require('child_process');
const https = require('https');

const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const winston = require('winston');
const storage = require('node-persist');

const pre = require('../utils.js').pre;

const META = {
    name: 'system',
    short: 'Execute system calls to manage Bosta',
    examples: [
        '@bosta respawn',
        '@bosta uptime',
        '@bosta recents',
        '@bosta coc',
    ],
};

// TODO :: Move this URL to the configuration file
const cocURL = 'https://raw.githubusercontent.com/mena-devs/code-of-conduct/master/README.md';

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
        // respawn command
        if (message.text) {
            const pattern = /<@([^>]+)>:? respawn/;
            const [, target] = message.text.match(pattern) || [];

            if (target === bot.self.id) {
                // Confirm receipt of the command
                rtm.sendMessage('Let me see what I can do about that! :thinking_face:', message.channel);

                // Execute the reboot order with 'forever'
                // This cannot be an async call
                cp.exec('forever restart main.js', (error) => {
                    if (error) {
                        rtm.sendMessage('Looks like that reboot isn\'t gonna happen today :grin:', message.channel);
                        winston.error(`Could not execute reboot: ${error}`);
                    }
                });
            }
        }

        // uptime command
        if (message.text) {
            const pattern = /<@([^>]+)>:? uptime/;
            const [, target] = message.text.match(pattern) || [];

            if (target === bot.self.id) {
                // Confirm receipt of the command
                rtm.sendMessage('Hold on a sec :thinking_face:', message.channel);

                // Retrieve the uptime
                cp.exec('forever list --plain', (error, stdout) => {
                    if (error) {
                        winston.error(`Could not execute your order: ${error}`);
                    } else {
                        rtm.sendMessage(
                            `There you go: \n ${pre(stdout)}`,
                            message.channel);
                    }
                });
            }
        }

        // Get recently joined members list
        if (message.text) {
            const pattern = /<@([^>]+)>:? recents/;
            const [, target] = message.text.match(pattern) || [];

            if (target === bot.self.id) {
                storage.init({ dir: config.plugins.system.recent_members_path })
                    .then(() => storage.getItem(config.plugins.system.recent_members_key))
                    .then((users) => {
                        if (users) {
                            const recentIds = users.split(';');
                            const formattedIds = recentIds.map(id => `<@${id}>`).join(' ');
                            rtm.sendMessage(`There you go: ${formattedIds}`, message.channel);
                        } else {
                            winston.info('Have not been keeping track of new users');
                            rtm.sendMessage('Sorry, I haven\'t been keeping track...', message.channel);
                        }
                    })
                    .catch(error => winston.error(`Could not retrieve recent users: ${error}`));
            }
        }

        // Retrieve the CoC and post it to channel
        if (message.text) {
            const pattern = /<@([^>]+)>:? coc/;
            const [, target] = message.text.match(pattern) || [];

            if (target === bot.self.id) {
                retrieveCoC()
                    .then((data) => {
                        rtm.sendMessage(pre(data), message.channel);
                    })
                    .catch(error => winston.error(`Could not post CoC: ${error}`));
            }
        }
    });
}

module.exports = {
    register,
    META,
};
