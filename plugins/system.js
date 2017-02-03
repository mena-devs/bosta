const cp = require('child_process');

const request = require('request');

const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

const winston = require('winston');

const META = {
    name: 'system',
    short: 'Execute system calls to manage Bosta',
    examples: [
        '@bosta respawn',
    ],
};

/**
 * Send a private message to a user
 *
 * @param {[type]} web      [description]
 * @param {[type]} receiver [description]
 * @param {[type]} message  [description]
 *
 * @return {[type]} [description]
 */
function rebootOrder() {
    return new Promise((resolve, reject) => {
        // Execute the reboot order with 'forever'
        cp.exec('forever restart main.js', (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve(`Goodbye cruel world...`);
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
        if (message.text) {
            const pattern = /<@([^>]+)>:? respawn/;
            const [, target, userId] = message.text.match(pattern) || [];

            if (target === bot.self.id) {
                // Confirm receipt of the command
                rtm.sendMessage(`Let me see what I can do about that! :thinking_face:`, message.channel);
                rebootOrder()
                    .then(response => {
                        winston.info(`I'm rebooting now... :face_with_rolling_eyes: `);
                        rtm.sendMessage(response, message.channel);
                    })
                    .catch(error => {
                        rtm.sendMessage(`Looks like that reboot isn't gonna happen today :grin:`, message.channel);
                        winston.error(`Could not execute reboot: ${error}`)
                    });
            }
        }
    });
}


module.exports = {
    register,
    META,
};
