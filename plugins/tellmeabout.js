const Plugin = require('../utils.js').Plugin;

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


function save(options, message, who, key, value) {
    storage
        .setItem(key, value)
        .then(_ => message.reply(`${key} saved.`));
}


function about(options, message, who, key) {
    storage
        .getItem(key)
        .then((value) => {
            if (value) {
                return `${key}: ${value}`;
            }

            return search(key);
        }).then(value => message.reply(value));
}


function forget(options, message, who, key) {
    storage
        .removeItem(key)
        .then((value) => {
            if (value) {
                message.reply(`${key} removed.`);
            } else {
                message.reply(`I do not know anything about ${key}`);
            }
        });
}


function register(bot, rtm, web, config) {
    storage.init({
        dir: config.plugins.tellmeabout.path,
    });

    const plugin = new Plugin({ bot, rtm, web, config });
    plugin.route(/<@([^>]+)>:? save (.+?) as: (.+)/, save, { self: true });
    plugin.route(/<@([^>]+)>:? forget (.+)/, forget, { self: true });
    plugin.route(/<@([^>]+)>:? about (.+)/, about, { self: true });
}


module.exports = {
    register,
    META,
};
