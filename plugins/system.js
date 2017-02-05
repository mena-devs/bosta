const cp = require('child_process');

const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

const winston = require('winston');

const META = {
    name: 'system',
    short: 'Execute system calls to manage Bosta',
    examples: [
        '@bosta respawn',
        '@bosta uptime',
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
function register(bot, rtm) {
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
                    } else {
                        winston.info('I\'m rebooting now... :face_with_rolling_eyes: ');
                        // TODO: response is not defined =?=
                        // rtm.sendMessage(response, message.channel);
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
                            `There you go: \n \`\`\`${stdout}\`\`\``,
                            message.channel);
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
