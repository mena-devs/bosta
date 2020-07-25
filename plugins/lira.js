const match = require('@menadevs/objectron');
const fetch = require('node-fetch');

const secret = require('../secret.json');

const logger = require('../logging.js');

/**
 * Gets the latest lira rate from http://tiny.cc/pkmlnz via Google Sheets API.
 * Note: Relies on data being available on a specific range in the sheet structure.
 * @param {string} sheetId
 * @param {string} range
 * @param {string} apiKey
 */
async function fetchLatestRateFromSheet(sheetId, range, apiKey) {
  const uri = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
  const response = await fetch(uri);
  const data = await response.json();

  const columnMap = {
    lastUpdateDay: 0,
    lastUpdateTime: 1,
    officialBuy: 2,
    officialSell: 3,
    parallelBuy: 4,
    parallelSell: 5,
    blackBuy: 6,
    blackSell: 7,
    analysis: 8
  };

  if (typeof data.values !== 'undefined' && data.values[0].length > 0) {
    const values = data.values[0];
    const fields = {};

    Object.keys(columnMap).forEach((fieldName) => {
      const columnValue = values[columnMap[fieldName]];

      if (typeof columnValue !== 'undefined' && columnValue != null) {
        fields[fieldName] = columnValue;
      } else {
        fields[fieldName] = '';
      }
    });

    return fields;
  } else {
    logger.error('Sheet structure not compatible with selected range');
  }
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

/**
 * Runs the lira rate command for fetching the latest lira rate
 * @param {object} options
 * @param {string} message
 */
async function liraRate(options, message, day) {
  const sheetId = '1_z0gtOy-Q8Pv4mOWkURpzjWkAlyc-ftI0JYHRHegoCw';
  let range = 'USD!A2:R2';

  // We can assume if there is a day parameter it would be yesterday
  // as it's hard coded in the router pattern for now
  if (typeof day !== 'undefined') {
    range = 'USD!A3:R3';
  }

  const data = await fetchLatestRateFromSheet(
    sheetId,
    range,
    secret.sheets_api_key
  );
  const lines = [
    `:money_with_wings: Black market: *BUY:* ${data.blackBuy} *SELL:* ${data.blackSell}`,
    `:dollar: Parallel market: *BUY:* ${data.parallelBuy} *SELL:* ${data.parallelSell}`,
    `:bank: Official: *BUY:* ${data.officialBuy} *SELL:* ${data.officialSell}`,
    `>${data.analysis.replace(/[\r\n]+/gm, '\n>')}`,
    `_Last updated: ${data.lastUpdateDay} ${data.lastUpdateTime} via shorturl.at/eKTV7 _`
  ];

  message.reply(lines.join('\n'));
}

const verbose = `
How to use this plugin:
    lira rate
    lira rate yesterday
    lira inflation
`;

module.exports = {
  name: 'lira',
  help: 'gets the latest lira rate',
  verbose,
  events: {
    message: (options, message) => {
      match(
        message,
        {
          type: 'message',
          text: /^lira rate(?<day> yesterday)?$/
        },
        (result) => liraRate(options, message, result.groups.day)
      );

      match(
        message,
        {
          type: 'message',
          text: /^lira inflation$/
        },
        (result) => liraInflation(options, message)
      );
    }
  }
};
