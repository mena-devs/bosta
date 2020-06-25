const match = require('@menadevs/objectron')
const assert = require('chai').assert
const suite = require('mocha').suite
const test = require('mocha').test
const {
  Blocks,
  Section,
  Image,
  Divider,
  Markdown
} = require('../blocks.js')

suite('Bosta Core Tests', () => {
  test('Successful Section, Markdown, Divider blocks generation', () => {
    /**
     * This exepected to be transformed to valid a JSON object as expected
     * by the Slack's API
     */
    const payload = Blocks(
      Section(
        Markdown(':wolframalpha: *Wolfram|Alpha Output:* :success:')
      ),
      Divider(),
      Section(
        Markdown('*Output:*')
      )
    )

    const result = match(payload, [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: ':wolframalpha: *Wolfram|Alpha Output:* :success:'
        }
      },
      {
        type: 'divider'
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Output:*'
        }
      }
    ])

    const expected = {
      match: true,
      total: 7,
      matches: {
        0: {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: ':wolframalpha: *Wolfram|Alpha Output:* :success:'
          }
        },
        1: { type: 'divider' },
        2: { type: 'section', text: { type: 'mrkdwn', text: '*Output:*' } }
      },
      groups: {}
    }

    assert.isTrue(result.match)
    assert.deepEqual(result, expected)
  })

  test('Successful Section, Markdown, Divider, Image blocks generation', () => {
    /**
     * This exepected to be transformed to valid a JSON object as expected
     * by the Slack's API
     */
    const payload = Blocks(
      Section(
        Markdown(':wolframalpha: *Wolfram|Alpha Output:* :success:')
      ),
      Divider(),
      Section(
        Markdown('*Output:*')
      ),
      Image('https://example.com/img/image1.png', 'test alternative text')
    )

    const result = match(payload, [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: ':wolframalpha: *Wolfram|Alpha Output:* :success:'
        }
      },
      {
        type: 'divider'
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Output:*'
        }
      },
      {
        type: 'image',
        image_url: 'https://example.com/img/image1.png',
        alt_text: 'test alternative text'
      }
    ])

    const expected = {
      match: true,
      total: 10,
      matches: {
        0: {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: ':wolframalpha: *Wolfram|Alpha Output:* :success:'
          }
        },
        1: { type: 'divider' },
        2: { type: 'section', text: { type: 'mrkdwn', text: '*Output:*' } },
        3: { type: 'image', image_url: 'https://example.com/img/image1.png', alt_text: 'test alternative text' }
      },
      groups: {}
    }

    assert.isTrue(result.match)
    assert.deepEqual(result, expected)
  })
})
