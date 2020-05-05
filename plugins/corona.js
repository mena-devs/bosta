const match = require('@menadevs/objectron')
const fetch = require('node-fetch')

const api = { uri: 'https://api.covid19api.com/' }

const verbose = `
How to use this plugin:
    *Stats per country live*
    corona LB
    *Stats per country by date*
    corona LB yesterday
    *Worldwide stats*
    corona world
`

/**
 * Fetch world summary
 *
 * @param {*} options
 * @param {*} message
 * @param {*} query
 */
async function world (options, message, query) {
  const url = `${api.uri}/world/total`
  const response = await fetch(url)
  const json = await response.json()

  message.reply(`Confirmed: ${json.TotalConfirmed}, Deaths: ${json.TotalDeaths}, Recovered: ${json.TotalRecovered}`)
  message.reply('Source: https://covid19api.com/')
}

/**
 * Fetch cummulative by country from a day before
 *
 * @param {*} options
 * @param {*} message
 * @param {*} query
 */
async function yesterday (options, message, query) {
  const url = `${api.uri}/total/country/${query}`
  const response = await fetch(url)
  let json = await response.json()

  json = json.slice(-2)[0]

  let active = json.Active

  if (active === 0) { active = json.Confirmed - (json.Deaths + json.Recovered) }

  message.reply(`Confirmed: ${json.Confirmed}, Deaths: ${json.Deaths}, Recovered: ${json.Recovered}, Active: ${active}, Date: ${json.Date}`)
  message.reply('Source: https://covid19api.com/')
}

/**
 * Fetch latest cummulative by country
 *
 * @param {*} options
 * @param {*} message
 * @param {*} query
 */
async function live (options, message, query) {
  const url = `${api.uri}/total/country/${query}`
  const response = await fetch(url)
  let json = await response.json()

  json = json.slice(-1)[0]
  let active = json.Active

  if (active === 0) { active = json.Confirmed - (json.Deaths + json.Recovered) }

  message.reply(`Confirmed: ${json.Confirmed}, Deaths: ${json.Deaths}, Recovered: ${json.Recovered}, Active: ${active}, Date: ${json.Date}`)
  message.reply('Source: https://covid19api.com/')
}

module.exports = {
  name: 'corona',
  help: 'COVID-19 spread live statistics',
  verbose,
  events: {
    message: (options, message) => {
      match(message, {
        type: 'message',
        text: /^[c|C]orona (?<code>[a-zA-Z]{2})$/
      }, (result) => live(options, message, result.groups.code))

      match(message, {
        type: 'message',
        text: /^[c|C]orona (?<code>[a-zA-Z]{2}) [y|Y]esterday$/
      }, (result) => yesterday(options, message, result.groups.code))

      match(message, {
        type: 'message',
        text: /^[c|C]orona [w|W]orld$/
      }, (result) => world(options, message))
    }
  }
}
