const https = require('https');
const winston = require('winston');
const Plugin = require('../utils.js').Plugin;

var wolfram = require('wolfram-alpha');

const META = {
    name: 'wolframalpha',
    short: 'Execute a computation using WolframAlpha\'s API',
    examples: [
        '@bosta wa `integrate 2x`',
        '@bosta wa `pi to 100 digits`'
    ],
};


function buildAttachement(results) {
    return new Promise((resolve, reject) => {
        const timestamp = Math.floor(new Date() / 1000);

        if (results.length == 0) {
            // Result not found shouldn't be handled as an error, 
            // so I'm resolving it instead of rejecting
            resolve({
                as_user: true,
                attachments: [{
                    text: `Couldn't compute your request`,
                    color: '#36a64f',
                    author_name: 'Bosta',
                    footer: 'Wolfram|Alpha',
                    footer_icon: 'https://platform.slack-edge.com/img/default_application_icon.png',
                    ts: timestamp
                }],
            });
        }

        const fields = results.map(function(obj) {
            var rObj = {};
            rObj['title'] = obj.title;
            rObj['value'] = obj.subpods[0].text;
            rObj['image'] = obj.subpods[0].image;
            rObj['short'] = false;
            return rObj;
        });

        const outputImage = (fields[1].image || '');

        resolve({
            as_user: true,
            attachments: [{
                color: '#36a64f',
                author_name: 'Bosta',
                fields: fields,
                image_url: outputImage,
                footer: 'Wolfram|Alpha',
                footer_icon: 'https://platform.slack-edge.com/img/default_application_icon.png',
                ts: timestamp
            }],
        });
    });
}


function waQuery(options, message, who, query) {
    if (!query) {
        message.reply('I got nothing to compute');
        return;
    }
    wolfram.query(query)
        .then(results => buildAttachement(results))
        .then(attachment => options.web.chat.postMessage(message.channel, '', attachment))
        .catch((error) => {
            winston.error(`${META.name} Error: ${error}`);
        });
}


function register(bot, rtm, web, config, secret) {
    const plugin = new Plugin({ bot, rtm, web, config });
    wolfram = wolfram.createClient(secret.wolframalpha_app_id);
    plugin.route(/<@([^>]+)>:? wa \`?(.+[^)])\`/, waQuery, { self: true });
}


module.exports = {
    register,
    META,
};