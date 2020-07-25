const SlackHook = require('winston-slack-webhook-transport');
const winston = require('winston');

const secret = require('./secret.json');
const config = require('./config.js');

module.exports = winston.createLogger({
  level: 'info',
  transports: [
    new SlackHook({
      webhookUrl: secret.winston_webhook,
      channel: config.main.logging.channel,
      username: config.main.logging.username,
      level: config.main.logging.level,
      handleExceptions: config.main.logging.handleExceptions
    })
  ]
});
