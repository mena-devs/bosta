const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

const META = {
    name: 'ping',
    short: 'pings the bot',
    examples: [
        '@bosta ping',
    ],
};

function register(bot, rtm) {
    rtm.on(RTM_EVENTS.MESSAGE, (message) => {
        if (message.text) {
            const pattern = /<@([^>]+)>:? ping/;
            const [, target] = message.text.match(pattern) || [];

            if (target === bot.self.id) {
                rtm.sendMessage('pong', message.channel);
            }
        }
    });
}

module.exports = {
    register,
    META,
};
