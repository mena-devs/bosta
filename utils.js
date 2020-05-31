function pre (text) {
  return `\`\`\`${text}\`\`\``
}

function patch (rtm, web, message) {
  message.reply = (text) => rtm.sendMessage(text, message.channel)
  message.reply_thread = (text) => {
    web.chat.postMessage(
      message.channel,
      text,
      { as_user: true, thread_ts: message.ts }
    )
  }
  message.reply_blocks = (text, blocks) => {
    console.dir(blocks, { depth: null })
    // console.log(text, blocks)
    web.chat.postMessage({
      channel: message.channel,
      text: 'HNews',
      blocks: blocks,
      as_user: true,
      thread_ts: message.ts
    }).catch((error) => console.error(error))
  }

  return message
}

module.exports = {
  patch,
  pre
}
