const checker = require('spellchecker');
const match = require('@menadevs/objectron');

const verbose = `
How to use this plugin:

  It is constittutionolly(sp?) illegal
  Only got an hour of dayligth(sp?) left. Better get started
  `;

function spell(message, word) {
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

const events = {
  message: (options, message) => {
    match(
      message,
      {
        type: 'message',
        text: /(?<word>\w+)\(sp\?\)/
      },
      (result) => spell(message, result.groups.word)
    );
  }
};

module.exports = {
  name: 'spellcheck',
  help: 'spell checks any word in a sentence',
  verbose,
  events,
  spell
};
