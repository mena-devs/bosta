const Plugin = require('../utils.js').Plugin;

const rp = require('request-promise');

const winston = require('winston');

const META = {
    name: 'wikipedia',
    short: 'pulls an extract from wikipedia',
    examples: [
        'wikipedia: foobar',
    ],
};

const API = '/w/api.php?format=json&redirects=1&action=query&prop=extracts&exintro=&explaintext=&titles=';


function wikipedia(title) {
    const values = o => Object.keys(o).map(k => o[k]);

    const options = {
        uri: `https://en.wikipedia.org${API}${encodeURIComponent(title)}`,
        json: true,
    };

    return new Promise((resolve, reject) => {
        rp(options)
            .then((json) => {
                if (json.query) {
                    const extract = values(json.query.pages)[0].extract;
                    const pageId = values(json.query.pages)[0].pageid;
                    const pageUrl = `https://en.wikipedia.org/?curid=${pageId}`;

                    if (extract) {
                        const text = extract.split('\n')[0];
                        resolve(`${text} ${pageUrl}`);
                    } else {
                        resolve(`Sorry, I could not find anything about ${title}`);
                    }
                }
            })
            .catch(error => reject(error));
    });
}


function handleWikipedia(options, message, text) {
    wikipedia(text)
        .then((extract) => {
            message.reply_thread(extract);
        }).catch((error) => {
            winston.error(`${META.name} Error: ${error}`);
        });
}


function register(bot, rtm, web, config) {
    const plugin = new Plugin({ bot, rtm, web, config });
    plugin.route(/^wikipedia: (.*)/, handleWikipedia, {});
}


module.exports = {
    register,
    META,
};
