const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

function buildHelp(meta) {
    const examples = meta.examples.map(e => `    example: ${e}`).join('\n');
    return `${meta.name} - ${meta.short}\n${examples}`;
}

function pre(text) {
    return `\`\`\`${text}\`\`\``;
}

class Plugin {
    constructor(options) {
        this.options = options;
        this.bot = options.bot;
        this.rtm = options.rtm;
        this.web = options.web;
        this.config = options.config;
        this.secret = options.secret;
        this.routes = [];

        this.initialize();
    }

    route(pattern, handler, routeOptions) {
        this.routes.push([pattern, handler, routeOptions]);
    }

    initialize() {
        this.rtm.on(RTM_EVENTS.MESSAGE, (message) => {
            message.reply = text => this.rtm.sendMessage(text, message.channel);
            if (message.text != null) {
                this.routes.forEach((route) => {
                    const [pattern, handler, routeOptions] = route;
                    const match = message.text.match(pattern) || [];

                    if (match.length > 0) {
                        const groups = match.slice(1);
                        const [who, _] = groups;

                        if (!routeOptions.self
                            || (routeOptions.self && who === this.options.bot.self.id)) {
                            handler(this.options, message, ...match.slice(1), routeOptions);
                        }
                    }
                });
            }
        });
    }
}

module.exports = {
    buildHelp,
    Plugin,
    pre,
};
