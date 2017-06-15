const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const storage = require('node-persist');
const winston = require('winston');

const META = {
    name: 'karma',
    short: 'Give someone karma points.',
    examples: [
        'phr34ck +5 @bassem',
        '@bosta karma @bassem',
    ],
};

function addKarma(config, userID, points) {
    storage.init({ dir: config.plugins.system.karma_log_path })
        .then(() => storage.getItem(userID))
        .then((currentPoints) => {
            let totalPoints = Number.parseInt(points, 10);

            if (currentPoints) {
                totalPoints += Number.parseInt(currentPoints, 10);
            }

            storage.setItem(userID, totalPoints);
        });
}

function getKarma(config, userID) {
    return storage.init({ dir: config.plugins.system.karma_log_path })
        .then(() => storage.getItem(userID))
        .then((user) => {
            return user;
        });
}

/**
 * Retrieves user information from ID
 * TODO: Move it to utils.js
 *
 * @param {[type]} bot [description]
 * @param {[type]} id  [description]
 *
 * @return {String} Username associated the ID provided
 */
function findUser(web, id) {
    return new Promise((resolve, reject) => {
        // Send a private message to the user with the CoC
        web.users.info(id, (err, res) => {
            if (err) {
                reject(`I don't know of a ${id}`);
            } else {
                resolve(res.user.name);
            }
        });
    });
}

function register(bot, rtm, web, config) {
    rtm.on(RTM_EVENTS.MESSAGE, (message) => {
        if (message.text) {
            const pattern = /\+([1-5])? <@([^>]+)>:?/;
            const [, points, targetUserID] = message.text.match(pattern) || [];

            if (message.user !== targetUserID) {
                addKarma(config, targetUserID, points);
            }

            const botPattern = /<@([^>]+)>:? karma <@([^>]+)>:?/;
            const [, target, userID] = message.text.match(botPattern) || [];

            if (target === bot.self.id) {
                getKarma(config, userID).then((user) => {
                    findUser(web, userID)
                        .then((response) => { message.reply(`${response}'s Karma-o-meter: ${user}`); })
                        .catch((error) => {
                            winston.error(`${META.name} - Error: ${error}`);
                        });
                    });
            }
        }
    });
}

module.exports = {
    register,
    META,
};
