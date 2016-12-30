const request = require('request');

const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

const winston = require('winston');


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


function pickTarget(bot, channel){
    return [...bot.channels, ...bot.groups].filter(c => c.id === channel)[0];
}


function loadRecentMessages(bot, web, config, channel, user) {
    return new Promise((resolve, reject) => {
        const target = pickTarget(bot, channel);
        let source = web.channels;

        if (target.is_group) {
            source = web.groups;
        }

        source.history(channel, { count: 1000 }, (error, response) => {
            if (error) {
                reject(error);
            } else {
                let messages = response.messages.filter(m => m.user === user.id);

                if (messages.length > config.plugins.sentiment.recent) {
                    messages = messages.slice(1, config.plugins.sentiment.recent);
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


function register(bot, rtm, web, config, secret) {
    rtm.on(RTM_EVENTS.MESSAGE, (message) => {
        if (message.text) {
            const who = message.text.match('how has ([^ ]+) been recently');

            if (who) {
                findUser(bot, who[1])
                    .then(user => loadRecentMessages(bot, web, config, message.channel, user))
                    .then(messages => analyseSentiment(secret, messages))
                    .then((sentiment) => {
                        rtm.sendMessage(
                            `${who[1]} has recently been ${sentiment.output.result}`,
                            message.channel);
                    })
                    .catch(error => winston.error(error));
            }
        }
    });
}


module.exports = {
    register,
};
