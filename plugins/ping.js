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
        message: (options, payload) => {
            const match = payload.text.match('^ping$') || [];

            if (match.length > 0) {
                options.rtm.sendMessage('new pong', payload.channel);
            }
        }
    },

    init: (options) => {
        options.logger.info('initializing ping');
    },

    destroy: (options) => {
        options.logger.info('destroying ping');
    }
}
