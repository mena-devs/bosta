const path = require('path');

const WebClient = require('@slack/client').WebClient;
const RtmClient = require('@slack/client').RtmClient;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

const winston = require('winston');
const winstonSlackTransport = require('winston-slack-transport');
const glob = require('glob');

const secret = require('./secret.json');
const config = require('./config.js');
const utils = require('./utils.js');

const values = o => Object.keys(o).map(k => o[k]);

function main() {
    const client = new RtmClient(secret.token);
    const web = new WebClient(secret.token);
    const plugins = {};
    let initial_connection = true;
    let bot;

    // Adding custon transport for Winston
    // in order to post logs into a specific channel
    if (config.winston.enabled) {
        winston.add(winstonSlackTransport, {
            webhook_url: secret.winston_webhook,
            channel: config.winston.channel,
            username: config.winston.username,
            level: config.winston.level,
            handleExceptions: config.winston.handleExceptions,
        });
    }

    client.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (data) => {
        bot = data;

        // Disable plugin reload on reconnect after connection
        // failure
        if (!initial_connection)
            return;

        winston.info(`Team: ${data.team.name} > Bot: ${data.self.name}`);

        glob.sync('./plugins/*.js').forEach((file) => {
            winston.info(`Found plugin: ${file}`);
            const plugin = require(path.resolve(file));
            plugin.register(data, client, web, config, secret);
            plugins[plugin.META.name] = utils.buildHelp(plugin.META);
        });

        plugins[''] = values(plugins).join('\n\n');
    });

    client.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
        if (!initial_connection) {
            winston.info('Reconnected...');
        } else {
            winston.info('Locked and loaded!');
            // Send a message to signal that the script has started / rebooted
            client.sendMessage(
                ':trollface:',
                config.main.bot_test_chan_id)
                .catch(error => winston.error(`RTM Re/Connect: ${error}`));

            initial_connection = false;
        }
    });

    client.on(RTM_EVENTS.MESSAGE, (message) => {
        if (message.text) {
            const pattern = /<@([^>]+)>:? help ?(.*)/;
            const [, target, topic] = message.text.match(pattern) || [];

            if (target === bot.self.id && plugins[topic]) {
                client.sendMessage(
                    utils.pre(plugins[topic]),
                    message.channel);
            }
        }
    });

    client.start();
}


if (require.main === module) {
    main();
}
