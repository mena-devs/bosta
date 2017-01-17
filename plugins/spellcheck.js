const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

const checker = require('spellchecker');

const META = {
    name: 'spellchecker',
    short: 'spell checks any word in a sentence',
    examples: [
        'it is constittutionolly(sp?) illegal',
    ],
};

function register(bot, rtm) {
    rtm.on(RTM_EVENTS.MESSAGE, (message) => {
        if (message.text) {
            const pattern = /(\w+)\(sp\?\)/;
            const [, word] = message.text.match(pattern) || [];
            if (word) {
                const wrong = checker.isMisspelled(word);
                const result = checker.getCorrectionsForMisspelling(word);

                if (!wrong) {
                    rtm.sendMessage(`${word} is spelled correctly.`, message.channel);
                } else if (result.length === 0) {
                    rtm.sendMessage(`I don't know how to fix ${word}`, message.channel);
                } else {
                    rtm.sendMessage(
                        `possible spelling for ${word}: ${result.join(', ')}`,
                        message.channel);
                }
            }
        }
    });
}


module.exports = {
    register,
    META,
};
