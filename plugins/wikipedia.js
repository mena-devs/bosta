const match = require('@menadevs/objectron')
const fetch = require('node-fetch')
const logger = require('../logging.js')

const verbose = `
How to use this plugin:
    wikipedia: foobar
`

const API = '/w/api.php?format=json&redirects=1&action=query&prop=extracts&exintro=&explaintext=&titles='

const wikipedia = (title) => {
  const uri = `https://en.wikipedia.org${API}${encodeURIComponent(title)}`

  return new Promise(async (resolve, reject) => {
    const response = await fetch(uri)
    const json = await response.json()

    if (json.query) {
      const extract = Object.values(json.query.pages)[0].extract
      const pageId = Object.values(json.query.pages)[0].pageid
      const pageUrl = `https://en.wikipedia.org/?curid=${pageId}`

      if (extract) {
        const text = extract.split('\n')[0]
        resolve(`${text} ${pageUrl}`)
      } else {
        resolve(`Sorry, I could not find anything about ${title}`)
      }
    }
  })
}

module.exports = {
  name: 'wikipedia',
  help: 'pulls an extract from wikipedia',
  verbose,
  events: {
    message: (options, message) => {
      match(message, {
        type: 'message',
        text: /^wikipedia: (?<topic>.*)/
      }, result => {
        wikipedia(result.groups.topic)
          .then((extract) => {
            message.reply(extract)
          }).catch((error) => {
            logger.error(`Wikipedia Error: ${error}`)
          })
      })
    }
  }
}
