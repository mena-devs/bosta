const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

const storage = require('node-persist');

const utils = require('../utils.js');

const META = {
    name: 'tellmeabout',
    short: 'records and plays text',
    examples: [
        '@bosta save snippet-security-risks as: the snippets are run in a container, they are perfectly sandboxed.',
        '@bosta about snippet-security-risks',
        '@bosta save stop-writing-classes as: https://www.youtube.com/watch?v=o9pEzgHorH0',
        '@bosta about stop-writing-classes',
    ],
};

function register(bot, rtm, web, config) {
    storage.init({
        dir: config.plugins.tellmeabout.path,
    });

    rtm.on(RTM_EVENTS.MESSAGE, (message) => {
        if (message.text) {
            const match = message.text.match(/<@([^>]+)>:? save ([^ ]+) as: (.*)/);

            if (match && match[1] === bot.self.id) {
                storage
                    .setItem(match[1], match[3])
                    .then(() => {
                        rtm.sendMessage(`${match[2]} saved.`, message.channel);
                    });
            }
        }

        if (message.text) {
            const match = message.text.match(/<@([^>]+)>:? about (.*)/);

            if (match && match[1] === bot.self.id) {
                storage
                    .getItem(match[1])
                    .then((value) => {
                        rtm.sendMessage(`${match[2]}: ${value}`, message.channel);
                    });
            }
        }
    });
}


module.exports = {
    register,
    META,
};
