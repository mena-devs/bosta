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
            const match = message.text.match(/<@([^>]+)>:? figlet (.*)/);

            if (match && match[1] === bot.self.id) {
                figlet(match[2], (err, data) => {
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
