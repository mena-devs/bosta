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

                // Execute the reboot order with 'forever'
                // This cannot be an async call
                cp.exec('forever restart main.js', (error, stdout, stderr) => {
                    if (error) {
                        rtm.sendMessage(`Looks like that reboot isn't gonna happen today :grin:`, message.channel);
                        winston.error(`Could not execute reboot: ${error}`)
                    } else {
                        winston.info(`I'm rebooting now... :face_with_rolling_eyes: `);
                        rtm.sendMessage(response, message.channel);
                    }
                });
            }
        }
    });
}


module.exports = {
    register,
    META,
};
