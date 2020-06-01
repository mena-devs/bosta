function pre (text) {
  return `\`\`\`${text}\`\`\``
}

function patch (rtm, web, message) {
  message.reply = (text) => rtm.sendMessage(text, message.channel)
  message.reply_thread = (text) => {
    web.chat.postMessage({
      channel: message.channel,
      text: text,
      as_user: true,
      thread_ts: message.ts
    }).catch((error) => console.error(error))
  }
  message.reply_blocks = (text, blocks) => {
    web.chat.postMessage({
      channel: message.channel,
      text: text,
      blocks: blocks,
      as_user: true,
      thread_ts: message.ts
    }).catch((error) => console.error(error))
  }
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
