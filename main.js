const path = require('path');

const WebClient = require('@slack/client').WebClient;
const RtmClient = require('@slack/client').RtmClient;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

const winston = require('winston');
const winston_slack_transport = require('winston-slack-transport');
const glob = require('glob');

const secret = require('./secret.json');
const config = require('./config.js');
const utils = require('./utils.js');

const values = o => Object.keys(o).map(k => o[k]);

function main() {
    const client = new RtmClient(secret.token);
    const web = new WebClient(secret.token);
    const plugins = {};
    let bot;

    // Adding custon transport for Winston
    // in order to post logs into a specific channel
    if (config.winston.enabled) {
        winston.add(winston_slack_transport, {
            webhook_url: secret.winston_webhook,
            channel: config.winston.channel,
            username: config.winston.username,
            level: config.winston.level,
            handleExceptions: config.winston.handleExceptions
        });
    }

    client.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (data) => {
        bot = data;
        winston.info(`GROUP: ${data.team.name} > MY NAME: ${data.self.name}`);

        glob.sync('./plugins/*.js').forEach((file) => {
            winston.info(`Found plugin: ${file}`);
            const plugin = require(path.resolve(file));
            plugin.register(data, client, web, config, secret);
            plugins[plugin.META.name] = utils.buildHelp(plugin.META);
        });

        plugins[''] = values(plugins).join('\n\n');
    });

    client.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
        winston.info("Now I can receive RTM events.");
        // Send a message to signal that the script has started / rebooted
        // C1X3769UJ is the encoded ID for #bot-test
        client.sendMessage(
            'All hail the BOSTA who from the ashes was born again like a Phoenix :trollface:',
            config.main.default_chan_id)
            .catch(error => winston.error(error));
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
