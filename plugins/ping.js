const Plugin = require('../utils.js').Plugin;

const META = {
    name: 'ping',
    short: 'pings the bot',
    examples: [
        '@bosta ping',
    ],
};

function ping(options, message, who) {
    message.reply('pong');
}

function pingThem(options, message, who, target) {
    message.reply(`${target} PING PING PINGGGGGG!`);
}

function register(bot, rtm, web, config) {
    const plugin = new Plugin({ bot, rtm, web, config });
    plugin.route(/<@([^>]+)>:? ping$/, ping, { self: true });
    plugin.route(/<@([^>]+)>:? ping (.+)/, pingThem, { self: true });
}

module.exports = {
    META,
    register,
};
