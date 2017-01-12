const path = require('path');

const WebClient = require('@slack/client').WebClient;
const RtmClient = require('@slack/client').RtmClient;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

const winston = require('winston');
const glob = require('glob');

const secret = require('./secret.json');
const config = require('./config.js');


function main() {
    const client = new RtmClient(secret.token);
    const web = new WebClient(secret.token);

    client.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (data) => {
        winston.info(`${data.team.name} > ${data.self.name}`);

        glob.sync('./plugins/*.js').forEach((file) => {
            winston.info(`Found plugin: ${file}`);
            const plugin = require(path.resolve(file));
            plugin.register(data, client, web, config, secret);
        });
    });

    client.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
        winston.info("I'm can now receive RTM events.");
    });

    client.start();
}


if (require.main === module) {
    main();
}
