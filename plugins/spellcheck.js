const checker = require('spellchecker');

const Plugin = require('../utils.js').Plugin;

const META = {
    name: 'spellchecker',
    short: 'spell checks any word in a sentence',
    examples: [
        'it is constittutionolly(sp?) illegal',
    ],
};


function spell(options, message, word) {
    const wrong = checker.isMisspelled(word);
    const result = checker.getCorrectionsForMisspelling(word);

    if (!wrong) {
        message.reply_thread(`${word} is spelled correctly.`);
    } else if (result.length === 0) {
        message.reply_thread(`I don't know how to fix ${word}`);
    } else {
        message.reply_thread(`possible spelling for ${word}: ${result.join(', ')}`);
    }
}


function register(bot, rtm, web, config) {
    const plugin = new Plugin({ bot, rtm, web, config });
    plugin.route(/(\w+)\(sp\?\)/, spell, {});
}


module.exports = {
    register,
    META,
};
