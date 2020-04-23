const rp = require('request-promise');
const Plugin = require('../utils.js').Plugin;


const META = {
  name: 'lira',
  short: 'Gets the latest lira rate',
  examples: [
    'lira rate',
    'lira inflation',
  ],
};

/**
 * Gets the latest lira rate from http://tiny.cc/pkmlnz via Google Sheets API.
 * Note: Relies on data being available on a specific range in the sheet structure.
 * @param {string} sheetId
 * @param {string} range
 * @param {string} apiKey
 */
function fetchLatestRateFromSheet(sheetId, range, apiKey) {
  const requestOptions = {
    uri: `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`,
    json: true
  };

  return new Promise((resolve, reject) => {
    rp(requestOptions)
      .then((data) => {
        if (typeof(data.values) != 'undefined' && data.values[0].length >= 8) {
          const values = data.values[0];
          const fields = {
            'lastUpdate': `${values[0]} ${values[1]}`,
            'officialBuy': values[2],
            'officialSell': values[3],
            'parallelBuy': values[4],
            'parallelSell': values[5],
            'blackBuy': values[6],
            'blackSell': values[7],
          };

          resolve(fields);
        } else {
          reject(
            new Error('Sheet structure not compatible with selected range')
          );
        }
      })
      .catch((error) => {
        reject(
          new Error(`[${error.error.code}] ${error.error.message}`)
        );
      });
  });
}

/**
 * Runs the lira rate command for fetching the latest lira rate 
 * @param {object} options
 * @param {string} message
 */
function liraRate(options, message) {
  const sheetId = '17MC8Gt5AwwAFzr7Awq3c85tV5baZJ--9U2drwnen8W8';
  const range = 'USD!A7:H7';

  fetchLatestRateFromSheet(sheetId, range, options.secret.sheets_api_key).then((data) => {
    const lines = [
      `:bank: Official: *BUY:* ${data['officialBuy']} *SELL:* ${data['officialSell']}`,
      `:dollar: Parallel market: *BUY:* ${data['parallelBuy']} *SELL:* ${data['parallelSell']}`,
      `:money_with_wings: Black market: *BUY:* ${data['blackBuy']} *SELL:* ${data['blackSell']}`,
      `_Last updated: ${data['lastUpdate']} via http://tiny.cc/pkmlnz _`,
    ];

    message.reply(lines.join('\n'));
  }).catch((err) => {
    message.reply(`:boom: Something is wrong with lira sheets API call: \n *${err.message}*`);
  });
}

/**
 * Try to check inflation rate. Or does it? :D 
 * @param {object} options
 * @param {string} message
 */
function liraInflation(options, message) {
  const liras = new Array(20).fill('lira wara lira');

  message.reply(`${liras.join(', ')} Bosta wins! :muscle:`);
}

function register(bot, rtm, web, config, secret) {
  const plugin = new Plugin({ bot, rtm, web, config, secret });
  plugin.route(/^lira rate$/, liraRate, {});
  plugin.route(/^lira inflation$/, liraInflation, {});
}

module.exports = {
    META,
    register,
};
