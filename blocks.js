module.exports = {
  Blocks: (...children) => { return children },
  PlainText: (text, emoji) => { return { type: 'plain_text', text, emoji } },
  Markdown: (text) => { return { type: 'mrkdwn', text } },
  Divider: () => { return { type: 'divider' } },
  Context: (...children) => { return { type: 'context', elements: children } },
  Fields: (...children) => { return { type: 'fields', fields: children } },
  Button: (text, value) => {
    return {
      type: 'button',
      text: {
        type: 'plain_text',
        text: text,
        emoji: true
      },
      value
    }
  },

  Section: (...children) => {
    return {
      type: 'section',
      ...(Object.fromEntries(children.map((child) => {
        switch (child.type) {
          case 'mrkdwn':
            return ['text', child]
          case 'plain_text':
            return ['text', child]
          case 'image':
            return ['accessory', child]
          case 'button':
            return ['accessory', child]
          case 'fields':
            return ['fields', child.fields]
        }
      })))
    }
  }
}
