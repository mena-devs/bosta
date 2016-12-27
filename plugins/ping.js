const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

function register(id, rtm) {
    rtm.on(RTM_EVENTS.MESSAGE, (message) => {
        if (message.text === 'test') {
            rtm.sendMessage('icle', message.channel);
        }
    });
}

module.exports = {
    register,
};
