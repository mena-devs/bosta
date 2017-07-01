const Plugin = require('../utils.js').Plugin;

const META = {
    name: 'ping',
    short: 'pings the bot',
    examples: [
        'ping',
        'ping john',
    ],
};

function ping(options, message) {
    message.reply_thread('pong');
}

function pingThem(options, message, target) {
    message.reply(`${target} wake up!`);
}

function register(bot, rtm, web, config) {
    const plugin = new Plugin({ bot, rtm, web, config });
    plugin.route(/^ping$/, ping, {});
    plugin.route(/^ping (.+)/, pingThem, {});
}

module.exports = {
    META,
    register,
};
