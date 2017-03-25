const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

const figlet = require('figlet');

const pre = require('../utils.js').pre;

const META = {
    name: 'figlet',
    short: 'figlet-izes text',
    examples: [
        '@bosta figlet dany boy',
    ],
};

function handleFiglet(bot, rtm, message) {
    return new Promise((resolve, reject) => {
        const pattern = /<@([^>]+)>:? figlet (.*)/;
        const [, target, text] = message.text.match(pattern) || [];

        if (target === bot.self.id && text) {
            figlet(text, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    rtm.sendMessage(pre(data), message.channel);
                    resolve(data);
                }
            });
        }
    });
}

function register(bot, rtm) {
    rtm.on(RTM_EVENTS.MESSAGE, (message) => {
        if (message.text) {
            handleFiglet(bot, rtm, message);
        }
    });
}


module.exports = {
    register,
    META,
    handleFiglet,
};
