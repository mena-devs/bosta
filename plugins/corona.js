const rp = require('request-promise')
const match = require('@menadevs/objectron')

const verbose = `
How to use this plugin:

  corona LB
  corona LB yesterday
  corona world
`

const api = {
  uri: 'https://api.covid19api.com/'
}

/**
 * Fetch world summary
 *
 * @param {*} options
 * @param {*} message
 * @param {*} query
 */
function world (message, options) {
  const request = {
    url: `${api.uri}/world/total`,
    json: true
  }

  rp(request)
    .then((json) => {
      message.reply(`Confirmed: ${json.TotalConfirmed}, Deaths: ${json.TotalDeaths}, Recovered: ${json.TotalRecovered}`)
      message.reply('Source: https://covid19api.com/')
    })
    .catch(error => options.logger.error(`${module.exports.name}: ${error}`))
}

/**
 * Fetch cummulative by country from a day before
 *
 * @param {*} options
 * @param {*} message
 * @param {*} query
 */
function byCountryYesterday (message, groups, options) {
  const request = {
    url: `${api.uri}/total/country/${groups.country}`,
    json: true
  }

  rp(request)
    .then((json) => {
      json = json.slice(-2)[0]

      let active = json.Active

      if (active === 0) { active = json.Confirmed - (json.Deaths + json.Recovered) }

      message.reply(`Confirmed: ${json.Confirmed}, Deaths: ${json.Deaths}, Recovered: ${json.Recovered}, Active: ${active}, Date: ${json.Date}`)
      message.reply('Source: https://covid19api.com/')
    })
    .catch(error => options.logger.error(`${module.exports.name}: ${error}`))
}

/**
 * Fetch latest cummulative by country
 *
 * @param {*} options
 * @param {*} message
 * @param {*} query
 */
function byCountry (message, groups, options) {
  const request = {
    url: `${api.uri}/total/country/${groups.country}`,
    json: true
  }

  rp(request)
    .then((json) => {
      json = json.slice(-1)[0]
      let active = json.Active

      if (active === 0) { active = json.Confirmed - (json.Deaths + json.Recovered) }

      message.reply(`Confirmed: ${json.Confirmed}, Deaths: ${json.Deaths}, Recovered: ${json.Recovered}, Active: ${active}, Date: ${json.Date}`)
      message.reply('Source: https://covid19api.com/')
    })
    .catch(error => options.logger.error(`${module.exports.name}: ${error}`))
}

const events = {
  message: (options, message) => {
    match(message, {
      type: 'message',
      text: /^[c|C]orona (?<country>[a-zA-Z]{2})$/
    }, result => byCountry(message, result.groups, options))

    match(message, {
      type: 'message',
      text: /^[c|C]orona (?<country>[a-zA-Z]{2}) [y|Y]esterday$/
    }, result => byCountryYesterday(message, result.groups, options))

    match(message, {
      type: 'message',
      text: /^[c|C]orona [w|W]orld$/
    }, result => world(message, options))
  }
}

module.exports = {
  name: 'corona',
  help: 'COVID-19 spread live statistics',
  verbose,
  events
}
