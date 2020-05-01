const path = require('path');
const fs = require('fs');

const { RTMClient } = require('@slack/rtm-api');
const { WebClient } = require('@slack/web-api');
const SlackHook = require('winston-slack-webhook-transport');
const winston = require('winston');

const secret = require('./secret.json');
const config = require('./config.js');
const utils = require('./utils.js');

const values = (o) => Object.keys(o).map((k) => o[k]);

function main() {
    const rtm = new RTMClient(secret.token);
    const web = new WebClient(secret.token);

    const logger = winston.createLogger({
        level: 'info',
        transports: [
            new SlackHook({
                webhookUrl: secret.winston_webhook,
                channel: config.main.logging.channel,
                username: config.main.logging.username,
                level: config.main.logging.level,
                handleExceptions: config.main.logging.handleExceptions,
            }),
        ],
    });

    const loadPlugin = (pluginPath) => {
        const filename = path.resolve(pluginPath);

        // Needed, otherwise it'll load from cache
        delete require.cache[filename];

        const module = require(filename);
        const pluginEvents = module.events;
        const listeners = {};

        Object.entries(pluginEvents).forEach(([name, func]) => {
            const listener = (payload) => {
                func({ logger, rtm, web }, utils.patch(rtm, web, payload));
            };

            rtm.on(name, listener);
            listeners[name] = listener;
        });

        module.listeners = listeners;

        if ('init' in module) {
            module.init({ logger, rtm, web });
        }

        return module;
    };

    config.plugins.forEach((pluginPath) => {
        let module = loadPlugin(pluginPath);

        // Hot reloads plugins.
        fs.watchFile(pluginPath, {interval: 1000}, (curr, prev) => {
            logger.info(`${pluginPath} changed, reloading.`);
            Object.entries(module.listeners).forEach(([name, listener]) => {
                rtm.removeListener(name, listener);
            });

            if ('destroy' in module) {
                module.destroy({ logger, rtm, web });
            }

            module = loadPlugin(pluginPath);
        });
    });

    (async () => {
        await rtm.start();
    })();
}

if (require.main === module) {
    main();
}
