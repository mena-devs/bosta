const figlet = require('figlet');

const pre = require('../utils.js').pre;
const Plugin = require('../utils.js').Plugin;


const META = {
    name: 'figlet',
    short: 'figlet-izes text',
    examples: [
        'figlet dany boy',
    ],
};


function handleFiglet(options, message, text) {
    figlet(text, (err, data) => {
        if (!err) {
            message.reply(pre(data));
        }
    });
}


function register(bot, rtm, web, config) {
    const plugin = new Plugin({ bot, rtm, web, config });
    plugin.route(/^figlet (.*)/, handleFiglet, {});
}


module.exports = {
    register,
    META,
    handleFiglet,
};
