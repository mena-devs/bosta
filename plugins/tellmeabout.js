const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

const storage = require('node-persist');

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
            const pattern = /<@([^>]+)>:? save (.+?) as: (.+)/;
            const [, target, key, value] = message.text.match(pattern) || [];

            if (target === bot.self.id) {
                storage
                    .setItem(key, value)
                    .then(() => {
                        rtm.sendMessage(`${key} saved.`, message.channel);
                    });
            }
        }

        if (message.text) {
            const pattern = /<@([^>]+)>:? about (.*)/;
            const [, target, key] = message.text.match(pattern) || [];

            if (target === bot.self.id) {
                storage
                    .getItem(key)
                    .then((value) => {
                        if (value) {
                            rtm.sendMessage(
                                `${key}: ${value}`,
                                message.channel);
                        } else {
                            rtm.sendMessage(
                                `I do not know anything about ${key}`,
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
