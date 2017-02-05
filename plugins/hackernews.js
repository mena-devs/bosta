const https = require('https');

const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

const winston = require('winston');

const META = {
    name: 'hackernews',
    short: 'Retrieves top N stories from YC Hacker News',
    examples: [
        '@bosta hnews (N)',
    ],
};

const hnAPIURL = 'https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty';
const hnStoryURL = 'https://hacker-news.firebaseio.com/v0/item/<STORY_ID>.json?print=pretty';

/**
 * Retrieve the CoC from the github URL
 *
 * @return {[type]} [description]
 */
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

/**
 * Loop over an array of Story IDs and retrieve each story's details
 * Resolve the promise only when each story's details have been retrieved
 *
 * @param {[type]} storyIDs [description]
 *
 * @return {[type]} [description]
 */
function retrieveStoryDetails(storyIDs) {
    return new Promise((resolve, reject) => {
        // Array containing story details objects
        const fields = [];
        // Loop over all the stories in the array and retrieve their details
        const requests = storyIDs.map((item) => {
            return new Promise((resolve, reject) => {
                const customURL = hnStoryURL.replace(/<STORY_ID>/, item);
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
        });
        // Waint until all requests have been resolved
        Promise.all(requests).then(() => resolve(fields));
    });
}

/**
 * Main
 *
 * @param {[type]} bot    [description]
 * @param {[type]} rtm    [description]
 * @param {[type]} web    [description]
 * @param {[type]} config [description]
 *
 * @return {[type]} [description]
 */
function register(bot, rtm, web) {
    rtm.on(RTM_EVENTS.MESSAGE, (message) => {
        if (message.text) {
            const pattern = /<@([^>]+)>:? hnews \(([0-9]+)\):?/;
            const [, target, nStories] = message.text.match(pattern) || [];

            if (target === bot.self.id) {
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
                        web.chat.postMessage(message.channel, '', attachment, (err) => {
                            if (err) {
                                winston.error('Error:', err);
                            } else {
                                winston.info('Hackernews articles retrieved and pushed to relevant channel.');
                            }
                        });
                    });
                }
            }
        }
    });
}


module.exports = {
    register,
    META,
};
