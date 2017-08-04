const storage = require('node-persist');
const winston = require('winston');
const Plugin = require('../utils.js').Plugin;

const META = {
    name: 'karma',
    short: 'Give or Deducate someone\'s karma points. Remember that if you deduct, 2 karma points will be taken from you as a penalty!',
    examples: [
        '+5 @jason',
        '-5 @jason',
        'karma @jason',
    ],
};

function updateKarma(options, message, points, userID, extraParams) {
    // console.log(extraParams.proceedure);
    // Deny user from adding Karma to himself
    if (message.user === userID) {
        return;
    }

    storage.init({ dir: options.config.plugins.system.karma_log_path })
        .then(() => storage.getItem(userID))
        .then((currentKarma) => {
            // Update the Karma for the receiver
            let totalKarma = Number.parseInt(points, 10);

            if (extraParams.proceedure === 'Increment') {
                if (currentKarma) {
                    totalKarma += Number.parseInt(currentKarma, 10);
                }
            } else if (extraParams.proceedure === 'Decrement') {
                if (!currentKarma) {
                    message.reply(`<@${userID}> has no Karma to deduct from!`);
                } else {
                    totalKarma = Number.parseInt(currentKarma, 10) - totalKarma;
                }
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
        })
        .then(() => storage.getItem(message.user))
        .then((requesterKarma) => {
            /**
             * In case of a Karma decrease remove 2 karma points
             * from the requester. This has the ability to reduce
             * a user's Karma to a negative value
             */
            if (extraParams.proceedure === 'Decrement') {
                let totalKarma = -2;
                if (requesterKarma) {
                    totalKarma = Number.parseInt(requesterKarma, 10) - 2;
                }

                storage.setItem(message.user, totalKarma);
            }
        });
}

function getKarma(options, message, userID) {
    return storage.init({ dir: options.config.plugins.system.karma_log_path })
        .then(() => storage.getItem(userID))
        .then((currentKarma) => {
            if (!currentKarma) {
                currentKarma = 0;
            }
            message.reply_thread(`<@${userID}>'s karma: ${currentKarma}`);
        }).catch(error => winston.error(`${META.name} - Error: ${error}`));
}

function register(bot, rtm, web, config) {
    const plugin = new Plugin({ bot, rtm, web, config });
    plugin.route(/\+([1-5])? <@([^>]+)>:?/, updateKarma, { proceedure: 'Increment' });
    plugin.route(/-([1-5])? <@([^>]+)>:?/, updateKarma, { proceedure: 'Decrement' });
    plugin.route(/^karma <@([^>]+)>:?/, getKarma, {});
}

module.exports = {
    register,
    META,
};
