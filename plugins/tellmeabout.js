const Plugin = require('../utils.js').Plugin;

const rp = require('request-promise');
const storage = require('node-persist');

const META = {
    name: 'tellmeabout',
    short: 'records, plays or searchs the interwebs',
    examples: [
        'save snippet-security-risks as: the snippets are run in a container, they are perfectly sandboxed.',
        'about snippet-security-risks',
        'save stop-writing-classes as: https://www.youtube.com/watch?v=o9pEzgHorH0',
        'about stop-writing-classes',
        'forget key-to-delete',
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


function save(options, message, key, value) {
    if (key.length > options.config.plugins.tellmeabout.max_key_length ||
        value.length > options.config.plugins.tellmeabout.max_value_length) {
        message.reply_thread('input too large, please reduce.');
    } else {
        storage
            .setItem(key, value)
            .then(_ => message.reply_thread(`${key} saved.`));
    }
}


function about(options, message, key) {
    storage
        .getItem(key)
        .then((value) => {
            if (value) {
                return `${key}: ${value}`;
            }

            return search(key);
        }).then(value => message.reply_thread(value));
}


function forget(options, message, key) {
    storage
        .removeItem(key)
        .then((value) => {
            if (value) {
                message.reply_thread(`${key} removed.`);
            } else {
                message.reply_thread(`I do not know anything about ${key}`);
            }
        });
}


function register(bot, rtm, web, config) {
    storage.init({
        dir: config.plugins.tellmeabout.path,
    });

    const plugin = new Plugin({ bot, rtm, web, config });
    plugin.route(/^save (.+?) as: (.+)/, save, {});
    plugin.route(/^forget (.+)/, forget, {});
    plugin.route(/^about (.+)/, about, {});
}


module.exports = {
    register,
    META,
};
