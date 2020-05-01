const match = require('@menadevs/objectron');

const help = `
    Pings the bot, or well, people.

    Examples:
        ping
        ping john
`;

module.exports = {
    name: 'ping',
    help,
    events: {
        message: (options, message) => {
            match(message, {
                type: 'message',
                text: /^ping$/,
            }, result => message.reply('pong'));

            match(message, {
                type: 'message',
                text: /^ping (?<who>.*)/,
            }, result => message.reply(`${result.groups.who} wake up!`));
        },
    },
};
