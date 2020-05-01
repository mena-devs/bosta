const os = require('os');
const config = require('../config.js');

var buildBlocks = (team, name, prefix, host) => {
    return (
        [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "Locked and Loaded!"
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": `*Team:* ${team}\n*Name*: ${name}\n*Prefix*: ${prefix}\n*Host*: ${host}`
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
