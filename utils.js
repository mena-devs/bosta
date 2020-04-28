const config = require('./config.js');
const secret = require('./secret.json');

function pre(text) {
    return `\`\`\`${text}\`\`\``;
}

class Router {
    constructor(options) {
        this.options = options;
        this.routes = [];
    }

    add(pattern, handler, routeOptions) {
        this.routes.push([pattern, handler, routeOptions]);
    }

    dispatch(message) {
        message.reply = (text) => this.options.rtm.sendMessage(text, message.channel);
        message.reply_thread = (text) => {
            this.options.web.chat.postMessage(
                message.channel,
                text,
                { as_user: true, thread_ts: message.ts },
            );
        };

        if (message.text != null) {
            this.routes.forEach((route) => {
                const [pattern, handler, routeOptions] = route;
                const match = message.text.match(pattern) || [];

                if (match.length > 0) {
                    const groups = match.slice(1);
                    const [who, _] = groups;

                    handler(this.options, message, ...match.slice(1), routeOptions);
                }
            });
        }
    }
}

module.exports = {
    Router,
    pre,
};
