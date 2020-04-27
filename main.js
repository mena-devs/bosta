const path = require('path');

const { RTMClient } = require('@slack/rtm-api');
const { WebClient } = require('@slack/web-api');
const SlackHook = require("winston-slack-webhook-transport");
const winston = require('winston');

const secret = require('./secret.json');
const config = require('./config.js');
const utils = require('./utils.js');

const values = o => Object.keys(o).map(k => o[k]);

function main() {
    const rtm = new RTMClient(secret.token);
    const web = new WebClient(secret.token);
    const plugins = {};
    let initialConnection = true;
    let bot;

    const logger = winston.createLogger({
        level: "info",
        transports: [
            new SlackHook({
                webhookUrl: secret.winston_webhook,
                channel: config.main.logging.channel,
                username: config.main.logging.username,
                level: config.main.logging.level,
                handleExceptions: config.main.logging.handleExceptions,
            })
        ]
    });

    rtm.on('authenticated', (data) => {
        bot = data;

        // Disable plugin reload on reconnect after connection failure
        if (!initialConnection) {
            return;
        }

        logger.info(`
            > Team: ${data.team.name}
            > Name: ${data.self.name}
            > Prefix: ${config.main.prefix}
        `);

        config.plugins.forEach((file) => {
            const plugin = require(path.resolve(file));
            plugin.register(data, rtm, web, config, secret);
            plugins[plugin.META.name] = utils.buildHelp(plugin.META);
        });

        plugins[''] = values(plugins).join('\n\n');
    });

    rtm.on('connected', () => {
        if (!initialConnection) {
            logger.info('Reconnected...');
        } else {
            logger.info('Locked and loaded!');
            initialConnection = false;
        }
    });

    rtm.on('message', (message) => {
        if (message.text) {
            const pattern = /<@([^>]+)>:? help ?(.*)/;
            const [, target, topic] = message.text.match(pattern) || [];

            if (target === bot.self.id && plugins[topic]) {
                rtm.sendMessage( utils.pre(plugins[topic]), message.channel);
            }
        }
    });

    rtm.start();
}


if (require.main === module) {
    main();
}
