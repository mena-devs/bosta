const match = require('@menadevs/objectron')

const {
  Blocks,
  Button,
  Actions
} = require('../blocks.js')

module.exports = {
  name: 'modal',
  help: 'showcase modal',
  verbose: 'modal',

  actions: (options, payload, respond) => {
    match(payload, {
      type: 'block_actions',
      actions: [{
        value: 'some value'
      }]
    }, result => {
      options.web.views.open({
        trigger_id: payload.trigger_id,
        view: {
          type: 'modal',
          callback_id: 'modal-identifier',
          title: {
            type: 'plain_text',
            text: 'Just a modal'
          },
          blocks: [
            {
              type: 'section',
              block_id: 'section-identifier',
              text: {
                type: 'mrkdwn',
                text: '*Welcome* to ~my~ Block Kit _modal_!'
              },
              accessory: {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Just a button'
                },
                action_id: 'button-identifier'
              }
            }
          ]
        }
      })
    })
  },

  events: {
    message: (options, message) => {
      match(message, {
        type: 'message',
        text: /^modal$/
      }, result => options.web.chat.postMessage({
        channel: message.channel,
        blocks: Blocks(Actions(Button('Load modal', 'some value'))),
        as_user: true
      }))
    }
  }
}
