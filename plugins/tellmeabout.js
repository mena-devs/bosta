const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

const rp = require('request-promise');
const storage = require('node-persist');

const META = {
    name: 'tellmeabout',
    short: 'records, plays or searchs the interwebs',
    examples: [
        '@bosta save snippet-security-risks as: the snippets are run in a container, they are perfectly sandboxed.',
        '@bosta about snippet-security-risks',
        '@bosta save stop-writing-classes as: https://www.youtube.com/watch?v=o9pEzgHorH0',
        '@bosta about stop-writing-classes',
        '@bosta forget key-to-delete',
    ],
};


function cleanup(text) {
    const pattern = /<a.*>(.*)<\/a>\s*(.*)/;
    const [, key, value] = text.match(pattern) || [];

    return `${key}: ${value}`;
}

function search(term) {
    const options = {
        uri: `https://duckduckgo.com/?format=json&q=${encodeURIComponent(term)}`,
        json: true,
    };

    return new Promise((resolve, reject) => {
        rp(options)
            .then((json) => {
                if (json) {
                    const topics = json.RelatedTopics
                        .filter(topic => topic.Result !== undefined)
                        .map(topic => cleanup(topic.Result))
                        .join('\n');

                    if (topics) {
                        resolve(topics);
                    } else {
                        resolve(`I don't know anything about ${term}`);
                    }
                } else {
                    resolve('invalid response, sorry!');
                }
            })
            .catch(error => reject(error));
    });
}


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
                            return `${key}: ${value}`;
                        }

                        return search(key);
                    })
                    .then(value => rtm.sendMessage(`${value}`, message.channel));
            }
        }

        if (message.text) {
            const pattern = /<@([^>]+)>:? forget (.*)/;
            const [, target, key] = message.text.match(pattern) || [];

            if (target === bot.self.id) {
                storage
                    .removeItem(key)
                    .then((value) => {
                        if (value) {
                            rtm.sendMessage(`${key} removed.`, message.channel);
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
