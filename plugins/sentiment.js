const request = require('request');
const winston = require('winston');

const Plugin = require('../utils.js').Plugin;

const META = {
    name: 'sentiment',
    short: 'provides a sentiment analysis on the last 10 messages of a user',
    examples: [
        'analyse jordan',
    ],
};

function findUser(bot, name) {
    return new Promise((resolve, reject) => {
        const members = bot.users.filter(m => m.name === name);

        if (members.length !== 1) {
            reject(`I don't know of a ${name}`);
        } else {
            resolve(members[0]);
        }
    });
}


function pickTarget(bot, channel) {
    return [...bot.channels, ...bot.groups].filter(c => c.id === channel)[0];
}


function loadRecentMessages(options, channel, user) {
    return new Promise((resolve, reject) => {
        const target = pickTarget(options.bot, channel);
        let source = options.web.channels;

        if (target.is_group) {
            source = options.web.groups;
        }

        source.history(channel, { count: 1000 }, (error, response) => {
            if (error) {
                reject(error);
            } else {
                let messages = response.messages.filter(m => m.user === user.id);

                if (messages.length > options.config.plugins.sentiment.recent) {
                    messages = messages.slice(1, options.config.plugins.sentiment.recent);
                }

                if (messages.length === 0) {
                    reject('User has not spoken recently');
                } else {
                    const text = messages.map(m => m.text).join('\n');
                    resolve(text);
                }
            }
        });
    });
}


function analyseSentiment(secret, messages) {
    return new Promise((resolve, reject) => {
        request.post({
            url: 'http://api.datumbox.com/1.0/SentimentAnalysis.json',
            form: {
                api_key: secret.datumbox,
                text: messages,
            },
            headers: {
                'User-Agent': 'request',
            },
        }, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                resolve(JSON.parse(body));
            }
        });
    });
}


function analyse(options, message, target) {
    findUser(options.bot, target)
        .then(user => loadRecentMessages(options, message.channel, user))
        .then(messages => analyseSentiment(options.secret, messages))
        .then(sentiment => message.reply(`${target} has recently been ${sentiment.output.result}`))
        .catch(error => winston.error(`${META.name} - Error: ${error}`));
}


function register(bot, rtm, web, config, secret) {
    const plugin = new Plugin({ bot, rtm, web, config, secret });
    plugin.route(/^analyse (.+)/, analyse, {});
}


module.exports = {
    register,
    META,
};
