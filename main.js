const path = require('path');
const fs = require('fs');

const { RTMClient } = require('@slack/rtm-api');
const { WebClient } = require('@slack/web-api');
const SlackHook = require('winston-slack-webhook-transport');
const winston = require('winston');

const secret = require('./secret.json');
const config = require('./config.js');

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

    const loadPlugin = (plugin_path) => {
        const filename = path.resolve(plugin_path)

        // Needed, otherwise it'll load from cache
        delete require.cache[filename];

        const module = require(filename);
        const plugin_events = module.events;
        const listeners = {};

        Object.entries(plugin_events).forEach(([name, func]) => {
            const listener =  (payload) => {
                func({logger, rtm, web}, payload);
            }
            rtm.on(name, listener);
            listeners[name] = listener;
        });

        module.listeners = listeners;

        if('init' in module)
            module.init({logger, rtm, web});

        return module;
    }

    config.plugins.forEach(plugin_path => {
        let module = loadPlugin(plugin_path);

        // Hot reloads plugins.
        fs.watchFile(plugin_path, (curr, prev) => {
            logger.info(`${plugin_path} changed, reloading.`);
            Object.entries(module.listeners).forEach(([name, listener]) => {
                rtm.removeListener(name, listener);
            });

            if('destroy' in module)
                module.destroy({logger, rtm, web});
            module = loadPlugin(plugin_path);
        });
    });

    (async () => {
        await rtm.start();
    })();
}

if (require.main === module) {
    main();
}
