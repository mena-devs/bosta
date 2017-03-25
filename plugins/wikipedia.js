const https = require('https');

const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

const winston = require('winston');

const META = {
    name: 'wikipedia',
    short: 'pulls an extract from wikipedia',
    examples: [
        '@bosta wikipedia LOL',
    ],
};

const API = '/w/api.php?format=json&redirects=1&action=query&prop=extracts&exintro=&explaintext=&titles=';


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
                    const extract = values(json.query.pages)[0].extract,
                          pageId = values(json.query.pages)[0].pageid,
                          pageUrl = 'https://en.wikipedia.org/?curid=' + pageId;

                    if (extract) {
                        resolve(extract.split('\n')[0] + ' ' + pageUrl);
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
        if (message.text) {
            const pattern = /<@([^>]+)>:? wikipedia (.*)/;
            const [, target, text] = message.text.match(pattern) || [];

            if (target === bot.self.id) {
                wikipedia(text)
                    .then((extract) => {
                        rtm.sendMessage(`> ${extract}`, message.channel);
                    }).catch(error => winston.error(error));
            }
        }
    });
}


module.exports = {
    register,
    META,
};
