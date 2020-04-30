const config = require('./config.js');
const secret = require('./secret.json');

function pre(text) {
    return `\`\`\`${text}\`\`\``;
}

function patch(rtm, web, message) {
    message.reply = (text) => rtm.sendMessage(text, message.channel);
    message.reply_thread = (text) => {
        web.chat.postMessage(
            message.channel,
            text,
            { as_user: true, thread_ts: message.ts },
        );
    };

    return message;
}

module.exports = {
    patch,
    pre,
};
