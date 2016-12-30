const https = require('https');

const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

const winston = require('winston');

const key = 'wikipedia';
const API = '/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=';


function wikipedia(title) {
    const values = o => Object.keys(o).map(k => o[k]);
    const options = {
        host: 'en.wikipedia.org',
        path: API + encodeURIComponent(title),
    };

    return new Promise((resolve, reject) => {
        https.get(options, (res) => {
            let body = '';

            res.on('data', (chunk) => {
                body += chunk;
            });

            res.on('end', () => {
                const json = JSON.parse(body);

                if (json.query) {
                    const extract = values(json.query.pages)[0].extract;

                    if (extract) {
                        resolve(extract.split('\n')[0]);
                    }
                }
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}


function register(bot, rtm) {
    rtm.on(RTM_EVENTS.MESSAGE, (message) => {
        if (message.text && message.text.toLocaleLowerCase().startsWith(key)) {
            const text = message.text.substring(key.length + 1);

            wikipedia(text)
                .then((extract) => {
                    rtm.sendMessage(`> ${extract}`, message.channel);
                }).catch(error => winston.error(error));
        }
    });
}


module.exports = {
    register,
};
