const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

const checker = require('spellchecker');


function register(bot, rtm) {
    rtm.on(RTM_EVENTS.MESSAGE, (message) => {
        if (message.text) {
            const word = message.text.match(/(\w+)\(sp\?\)/);
            if (word) {
                const wrong = checker.isMisspelled(word[1]);
                const result = checker.getCorrectionsForMisspelling(word[1]);

                if (!wrong) {
                    rtm.sendMessage(`${word[1]} is spelled correctly.`, message.channel);
                } else if (result.length === 0) {
                    rtm.sendMessage(`I don't know how to fix ${word[1]}`, message.channel);
                } else {
                    rtm.sendMessage(
                        `possible spelling for ${word[1]}: ${result.join(', ')}`,
                        message.channel);
                }
            }
        }
    });
}


module.exports = {
    register,
};
