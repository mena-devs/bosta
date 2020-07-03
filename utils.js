function pre (text) {
  return `\`\`\`${text}\`\`\``
}

function patch (web, message) {
  // Reply in channel or in DM
  message.reply = (text) => web.chat.postMessage({
    as_user: true,
    channel: message.channel,
    text
  })
  // Reply to the user's message in a thread
  message.reply_thread = (text) => {
    web.chat.postMessage({
      channel: message.channel,
      text: text,
      as_user: true,
      thread_ts: message.ts
    })
  }
  // Reply using the blocks API
  message.reply_blocks = (text, blocks) => {
    web.chat.postMessage({
      channel: message.channel,
      text: text,
      blocks: blocks,
      as_user: true,
      thread_ts: message.ts
    })
  }
  // Reply with an emoji
  message.react = (emoji) => {
    web.reactions.add({
      channel: message.channel,
      name: emoji,
      timestamp: message.ts
    })
  }

  return message
}

module.exports = {
  patch,
  pre
}
