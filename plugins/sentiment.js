const request = require('request');

const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

const winston = require('winston');


function findUser(web, name) {
    return new Promise((resolve, reject) => {
        web.users.list((error, response) => {
            if (error) {
                reject(error);
            } else {
                const members = response.members.filter(m => m.name === name);

                if (members.length !== 1) {
                    reject('Invalid user');
                } else {
                    resolve(members[0].id);
                }
            }
        });
    });
}

function loadRecentMessages(web, config, channel, user) {
    return new Promise((resolve, reject) => {
        web.channels.history(channel, { count: 1000 }, (error, response) => {
            if (error) {
                reject(error);
            } else {
                let messages = response.messages.filter(m => m.user === user);

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


function register(id, rtm, web, config, secret) {
    rtm.on(RTM_EVENTS.MESSAGE, (message) => {
        if (message.text) {
            const who = message.text.match('how has ([^ ]+) been recently');

            if (who) {
                findUser(web, who[1])
                    .then(user => loadRecentMessages(web, config, message.channel, user))
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
