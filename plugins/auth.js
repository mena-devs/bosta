const os = require('os');
const config = require('../config.js');

var buildBlocks = (team, name, prefix, host) => {
    const plugins = config.plugins.map((plugin) => {
        return { "type": "plain_text", "text": plugin };
    });

    return (
        [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `*Team:* ${team}\n*Name*: ${name}\n*Prefix*: ${prefix}\n*Host*: ${host}`
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*Installed Plugins:*"
                },
                "fields": plugins,
            },
            {
                "type": "divider"
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": "Locked and Loaded!"
                    }
                ]
            }
        ]
    )
};

module.exports = {
    name: 'auth',
    help: 'Plugin: Bot Auth',

    events: {
        authenticated: (options, payload) => {

            options.web.chat.postMessage({
                channel: config.main.logging.channel,
                blocks: buildBlocks(
                    payload.team.name,
                    payload.self.name,
                    config.main.prefix,
                    os.hostname()
                )
            });

        },
    },
};
