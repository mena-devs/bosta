const path = require('path');

const WebClient = require('@slack/client').WebClient;
const RtmClient = require('@slack/client').RtmClient;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

const winston = require('winston');
const glob = require('glob');

const config = require('./config.json');

const client = new RtmClient(config.token);
const web = new WebClient(config.token);


client.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (data) => {
    winston.info(`${data.team.name} > ${data.self.name}`);
    glob.sync('./plugins/*.js').forEach((file) => {
        winston.info(`Found plugin: ${file}`);
        const plugin = require(path.resolve(file));
        plugin.register(data.self.id, client, web, config);
    });
});


client.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
    winston.info('I\'m to receive RTM events.');
});

client.start();
