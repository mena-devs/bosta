const storage = require('node-persist');
const winston = require('winston');
const Plugin = require('../utils.js').Plugin;

const META = {
    name: 'karma',
    short: 'Give someone karma points.',
    examples: [
        '+5 @jason',
        '@bosta karma @jason',
    ],
};

function addKarma(options, message, points, userID) {
    // Deny user from adding Karma to himself
    if (message.user === userID) {
        return;
    }

    storage.init({ dir: options.config.plugins.system.karma_log_path })
        .then(() => storage.getItem(userID))
        .then((currentKarma) => {
            let totalKarma = Number.parseInt(points, 10);

            if (currentKarma) {
                totalKarma += Number.parseInt(currentKarma, 10);
            }

            storage.setItem(userID, totalKarma);

            const numbersName = ['one', 'two', 'three', 'four', 'five'];

            /**
             * react to the message as an acknowledgment
             * since array is 0 indexed, we'll use points -1
             * example:
             *  +3 @username
             *  will use numbersName[2]
             */

            options.web.reactions.add(numbersName[points - 1], {
                channel: message.channel,
                timestamp: message.ts,
            });
        });
}

function getKarma(options, message, who, userID) {
    return storage.init({ dir: options.config.plugins.system.karma_log_path })
        .then(() => storage.getItem(userID))
        .then((currentKarma) => {
            if (!currentKarma) {
                currentKarma = 0;
            }
            message.reply(`<@${userID}>'s Karma-o-meter: ${currentKarma}`);
        })
        .catch(error => winston.error(`${META.name} - Error: ${error}`));
}

function register(bot, rtm, web, config) {
    const plugin = new Plugin({ bot, rtm, web, config });
    plugin.route(/\+([1-5])? <@([^>]+)>:?/, addKarma, { });
    plugin.route(/<@([^>]+)>:? karma <@([^>]+)>:?/, getKarma, { self: true });
}

module.exports = {
    register,
    META,
};
