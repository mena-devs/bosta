const match = require('@menadevs/objectron');

const verbose = `
How to use this plugin:

    chmod
    chmod rwx,r-w,r--
    chmod 0644
`;

const map = {
  '---': '0',
  '--x': '1',
  '-w-': '2',
  '-wx': '3',
  'r--': '4',
  'r-x': '5',
  'rw-': '6',
  'rwx': '7'
};

/**
 * For each 'rwx' belonging to a particular group
 * find the associated octal value from map
 *
 * @param {*} message Message object
 * @param {*} groups RegEx named groups returned by match()
 */
const symbolicToOctal = (message, groups) => {
  const { owner, group, others } = groups;
  message.reply(`chmod ${map[owner]}${map[group]}${map[others]}`);
};

/**
 * Assume octal is a string, loop over each digit then
 * find the key in map that belongs to each digit
 *
 * @param {*} message Message object
 * @param {*} groups RegEx named groups returned by match()
 */
const octalToSymbolic = (message, groups) => {
  const { octal } = groups;
  const value = octal
    .split('')
    .map((digit) => Object.keys(map).find((key) => map[key] === digit));
  message.reply(`chmod ${octal}: ${value}`);
};

const events = {
  message: (options, message) => {
    /**
     * Handle conversion from symbolic to octal
     */
    match(
      message,
      {
        type: 'message',
        text: /^chmod (?<owner>[rwx-]{3}),(?<group>[rwx-]{3}),(?<others>[rwx-]{3})$/
      },
      (result) => {
        return symbolicToOctal(message, result.groups);
      }
    );

    /**
     * Handle conversion from octal to symbolic
     */
    match(
      message,
      {
        type: 'message',
        text: /^chmod (?<octal>[0-7]{3})$/
      },
      (result) => {
        return octalToSymbolic(message, result.groups);
      }
    );
  }
};

module.exports = {
  name: 'chmod',
  help: 'converts linux file permissions between octal or symbolic',
  verbose,
  events
};
