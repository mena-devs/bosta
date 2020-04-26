const rp = require('request-promise');
const winston = require('winston');
const Plugin = require('../utils.js').Plugin;

const META = {
    name: 'corona',
    short: 'COVID-19 spread live statistics',
    examples: [
        '## Stats per country live',
        'corona LB',
        '## Stats per country by date',
        'corona LB yesterday',
        '## Worldwide stats',
        'corona world'
    ],
};

const api = {
    uri: 'https://api.covid19api.com/',
}

/**
 * Fetch world summary 
 * 
 * @param {*} options 
 * @param {*} message 
 * @param {*} query 
 */
function world(options, message, query) {
    const request = {
        url: `${api.uri}/world/total`,
        json: true
    };

    rp(request)
        .then((json) => {
            message.reply(`Confirmed: ${json.TotalConfirmed}, Deaths: ${json.TotalDeaths}, Recovered: ${json.TotalRecovered}`);
        })
        .catch(error => winston.error(`${META.name} Error: ${error}`));
}

/**
 * Fetch cummulative by country from a day before
 * 
 * @param {*} options 
 * @param {*} message 
 * @param {*} query 
 */
function yesterday(options, message, query) {
    const request = {
        url: `${api.uri}/total/country/${query}`,
        json: true
    };

    rp(request)
        .then((json) => {
            json = json.slice(-2)[0];
            message.reply(`Confirmed: ${json.Confirmed}, Deaths: ${json.Deaths}, Recovered: ${json.Recovered}, Active: ${json.Active}, Date: ${json.Date}`);
        })
        .catch(error => winston.error(`${META.name} Error: ${error}`));
}

/**
 * Fetch latest cummulative by country
 * 
 * @param {*} options 
 * @param {*} message 
 * @param {*} query 
 */
function live(options, message, query) {
    const request = {
        url: `${api.uri}/total/country/${query}`,
        json: true
    };

    rp(request)
        .then((json) => {
            json = json.slice(-1)[0];
            message.reply(`Confirmed: ${json.Confirmed}, Deaths: ${json.Deaths}, Recovered: ${json.Recovered}, Active: ${json.Active}, Date: ${json.Date}`);
        })
        .catch(error => winston.error(`${META.name} Error: ${error}`));
}

function register(bot, rtm, web, config, secret) {
    const plugin = new Plugin({ bot, rtm, web, config });
    plugin.route(/^[c|C]orona ([a-zA-Z]{2})$/, live, {});
    plugin.route(/^[c|C]orona ([a-zA-Z]{2}) [y|Y]esterday$/, yesterday, {});
    plugin.route(/^[c|C]orona [w|W]orld$/, world, {});
}


module.exports = {
    register,
    META,
};