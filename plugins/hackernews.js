const https = require('https');
const winston = require('winston');
const Plugin = require('../utils.js').Plugin;

const META = {
    name: 'hackernews',
    short: 'Retrieves top N stories from YC Hacker News',
    examples: [
        '@bosta hnews 10',
    ],
};

const hnAPIURL = 'https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty';
const hnStoryURL = 'https://hacker-news.firebaseio.com/v0/item/<STORY_ID>.json?print=pretty';


function retrieveStories(nStories) {
    return new Promise((resolve, reject) => {
        https.get(hnAPIURL, (res) => {
            // Combine the chunks that are retrieved
            const responseParts = [];
            res.setEncoding('utf8');
            res.on('data', (d) => {
                responseParts.push(d);
            });
            // Combine the chunks and resolve
            res.on('end', () => {
                const storyIDs = JSON.parse(responseParts.join(''));
                resolve(storyIDs.slice(0, nStories));
            });
        }).on('error', (e) => {
            reject(e);
        });
    });
}


function retrieveStoryText(storyID, fields) {
    return new Promise((resolve, reject) => {
        const customURL = hnStoryURL.replace(/<STORY_ID>/, storyID);
        https.get(customURL, (res) => {
            // Combine the chunks that are retrieved
            const responseParts = [];
            res.setEncoding('utf8');
            res.on('data', (d) => {
                responseParts.push(d);
            });
            // Combine the chunks and resolve
            res.on('end', () => {
                const parsed = JSON.parse(responseParts.join(''));
                const storyField = {
                    title: `${parsed.score} - ${parsed.title}`,
                    value: parsed.url,
                    short: false,
                };
                fields.push(storyField);
                resolve();
            });
        }).on('error', (e) => {
            reject(e);
        });
    });
}


function retrieveStoryDetails(storyIDs) {
    return new Promise((resolve) => {
        const fields = [];
        const requests = [];

        storyIDs.forEach((item) => {
            requests.push(retrieveStoryText(item, fields));
        });

        Promise.all(requests).then(() => resolve(fields));
    });
}


function hnews(options, message, who, nStories) {
    if (nStories) {
        retrieveStories(nStories)
        .then(response => retrieveStoryDetails(response))
        .then((response) => {
            const attachment = {
                as_user: true,
                attachments: [
                    {
                        color: '#36a64f',
                        author_name: 'Bosta',
                        title: `Top ${nStories} Hacker News Stories`,
                        fields: response,
                        footer: 'Automation',
                        footer_icon: 'https://platform.slack-edge.com/img/default_application_icon.png',
                    },
                ],
            };

            // Post the message
            options.web.chat.postMessage(message.channel, '', attachment, (err) => {
                if (err) {
                    winston.error('HN Plugin Error:', err);
                } else {
                    winston.info('Hackernews articles retrieved and pushed to relevant channel.');
                }
            });
        });
    }
}


function register(bot, rtm, web, config) {
    const plugin = new Plugin({ bot, rtm, web, config });
    plugin.route(/<@([^>]+)>:? hnews ([0-9]+):?/, hnews, { self: true });
}

module.exports = {
    register,
    META,
};
