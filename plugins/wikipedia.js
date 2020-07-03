const match = require('@menadevs/objectron')
const fetch = require('node-fetch')

const verbose = `
How to use this plugin:
    wikipedia: foobar
`

const API = '/w/api.php?format=json&redirects=1&action=query&prop=extracts&exintro=&explaintext=&titles='

const wikipedia = async (title) => {
  const uri = `https://en.wikipedia.org${API}${encodeURIComponent(title)}`

  const response = await fetch(uri)
  const json = await response.json()

  if (json.query) {
    const extract = Object.values(json.query.pages)[0].extract
    const pageId = Object.values(json.query.pages)[0].pageid
    const pageUrl = `https://en.wikipedia.org/?curid=${pageId}`

    if (extract) {
      const text = extract.split('\n')[0]
      return `${text} ${pageUrl}`
    } else {
      return `Sorry, I could not find anything about ${title}`
    }
  }
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
      }, async (result) => {
        const extract = await wikipedia(result.groups.topic)
        message.reply(extract)
      })
    }
  }
}
