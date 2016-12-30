const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

const figlet = require('figlet');


function register(bot, rtm) {
    rtm.on(RTM_EVENTS.MESSAGE, (message) => {
        if (message.text
                && message.text.startsWith('figlet')) {
            const text = message.text.substring(7);
            figlet(text, (err, data) => {
                rtm.sendMessage(`\`\`\`${data}\`\`\``, message.channel);
            });
        }
    });
}


module.exports = {
    register,
};
