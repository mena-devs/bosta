const storage = require('node-persist');
const winston = require('winston');
const Plugin = require('../utils.js').Plugin;

const META = {
    name: 'karma',
    short: 'Give someone karma points.',
    examples: [
        '+5 @bassem',
        '@bosta karma @bassem',
    ],
};

function addKarma(options, message, points, userID) {
    // Deny user from adding Karma to himself
    if (message.user == userID)
        return;

    storage.init({ dir: options.config.plugins.system.karma_log_path })
        .then(() => storage.getItem(userID))
        .then((currentKarma) => {
            let totalKarma = Number.parseInt(points, 10);

            if (currentKarma) {
                totalKarma += Number.parseInt(currentKarma, 10);
            }

            storage.setItem(userID, totalKarma);
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
