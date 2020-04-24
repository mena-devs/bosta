const rp = require('request-promise');
const Plugin = require('../utils.js').Plugin;


const META = {
  name: 'lira',
  short: 'Gets the latest lira rate',
  examples: [
    'lira rate',
    'lira rate yesterday',
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

  const columnMap = {
    'lastUpdateDay': 0,
    'lastUpdateTime': 1,
    'officialBuy': 2,
    'officialSell': 3,
    'parallelBuy': 4,
    'parallelSell': 5,
    'blackBuy': 6,
    'blackSell': 7,
    'analysis': 17
  };

  return new Promise((resolve, reject) => {
    rp(requestOptions)
      .then((data) => {
        if (typeof(data.values) != 'undefined' && data.values[0].length > 0) {
          const values = data.values[0];
          let fields = {};

          Object.keys(columnMap).forEach((fieldName) => {
            let columnValue = values[columnMap[fieldName]];

            if(typeof(columnValue) != 'undefined' && columnValue != null) {
              fields[fieldName] = columnValue;
            } else {
              fields[fieldName] = '';
            }
          });

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
function liraRate(options, message, day) {
  const sheetId = '17MC8Gt5AwwAFzr7Awq3c85tV5baZJ--9U2drwnen8W8';
  let range = 'USD!A7:R7';

  // We can assume if there is a day parameter it would be yesterday
  // as it's hard coded in the router pattern for now
  if (typeof(day) != 'undefined') {
    range = 'USD!A8:R8';
  }

  fetchLatestRateFromSheet(sheetId, range, options.secret.sheets_api_key).then((data) => {
    const lines = [
      `:money_with_wings: Black market: *BUY:* ${data['blackBuy']} *SELL:* ${data['blackSell']}`,
      `:dollar: Parallel market: *BUY:* ${data['parallelBuy']} *SELL:* ${data['parallelSell']}`,
      `:bank: Official: *BUY:* ${data['officialBuy']} *SELL:* ${data['officialSell']}`,
      `>${ data['analysis'].replace(/[\r\n]+/gm, '\n>')}`,
      `_Last updated: ${data['lastUpdateDay']} ${data['lastUpdateTime']} via http://tiny.cc/pkmlnz _`,
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
  plugin.route(/^lira rate( yesterday)?$/i, liraRate, {});
  plugin.route(/^lira inflation$/i, liraInflation, {});
}

module.exports = {
    META,
    register,
};
