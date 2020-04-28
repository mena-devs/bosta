const { Router } = require('../utils.js');

function ping(options, message) {
    message.reply('pong');
}

function pingThem(options, message, target) {
    message.reply(`${target} wake up!`);
}

module.exports = {
    name: 'ping',
    help: `
        Plugin: Help
        Description: Pings the bot, or well, people.
        Examples:
            ping
            ping john
    `,

    events: {
        message: (options, message) => {
            const router = new Router(options);

            router.add(/^ping$/, ping);
            router.add(/^ping (.+)/, pingThem);

            router.dispatch(message);
        },
    },

    init: (options) => {
        options.logger.info('initializing ping');
    },

    destroy: (options) => {
        options.logger.info('destroying ping');
    },
};
