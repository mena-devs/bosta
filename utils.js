function pre (text) {
  return `\`\`\`${text}\`\`\``
}

function patch (web, message) {
  message.reply = (text) => web.chat.postMessage({ channel: message.channel, text, as_user: true })
  message.reply_thread = (text) => {
    web.chat.postMessage(
      message.channel,
      text,
      { as_user: true, thread_ts: message.ts }
    )
  }

  return message
}

module.exports = {
  patch,
  pre
}
