const request = require('request');

const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

const storage = require('node-persist');

const winston = require('winston');

const META = {
    name: 'newuser',
    short: 'Greets new users and sends them a copy of the code of conduct',
    examples: [
        '@bosta greet @Username',
    ],
};

function findUser(bot, id) {
    return new Promise((resolve, reject) => {
        const members = bot.users.filter(m => m.id === id);

        if (members.length !== 1) {
            reject(`I don't know of a ${id}`);
        } else {
            resolve(members[0].name);
        }
    });
}

function register(bot, rtm, web, config) {
    rtm.on(RTM_EVENTS.MESSAGE, (message) => {
        if (message.text) {
            const pattern = /<@([^>]+)>:? greet <@([^>]+)>:?/;
            const [, target, user] = message.text.match(pattern) || [];
            
            if (target === bot.self.id) {
                findUser(bot, user)
                    .then(user => {
                        rtm.sendMessage(`Hello ${user}`, message.channel);
                    })
                    .catch(error => winston.error(error));
            }
        }
    });
}


module.exports = {
    register,
    META,
};
