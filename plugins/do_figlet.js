const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

const figlet = require('figlet');

const META = {
    name: 'figlet',
    short: 'figlet-izes text',
    examples: [
        '@bosta figlet dany boy',
    ],
};

function register(bot, rtm) {
    rtm.on(RTM_EVENTS.MESSAGE, (message) => {
        if (message.text) {
            const pattern = /<@([^>]+)>:? figlet (.*)/;
            const [, target, text] = message.text.match(pattern) || [];

            if (target === bot.self.id) {
                figlet(text, (err, data) => {
                    rtm.sendMessage(`\`\`\`${data}\`\`\``, message.channel);
                });
            }
        }
    });
}


module.exports = {
    register,
    META,
};
