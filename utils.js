function pre (text) {
  return `\`\`\`${text}\`\`\``
}

function patch (web, message) {
  message.reply = (text) => web.chat.postMessage({
    as_user: true,
    channel: message.channel,
    text
  })

  message.reply_thread = (text) => web.chat.postMessage({
    as_user: true,
    thread_ts: message.ts,
    channel: message.channel,
    text
  })

  return message
}

module.exports = {
  patch,
  pre
}
