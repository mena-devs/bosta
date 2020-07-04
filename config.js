const path = require('path');

const config = {
  main: {
    prefix: 'Remote',
    general_channel_id: 'C03B400RU',
    bot_test_channel_id: 'C1X3769UJ',

    logging: {
      enabled: true,
      channel: '#bot-log',
      username: 'Bosta',
      level: 'info',
      handleExceptions: true
    }
  },
  // Plugin specific configuration
  karma: {
    karma_log: `${__dirname}/_storage/karma/`
  },
  newuser: {
    coc_url:
      'https://raw.githubusercontent.com/mena-devs/code-of-conduct/master/GREETING.md',
    // Maximum number of recent joiners to store
    max_recent_users: 10,
    recent_users_store: `${__dirname}/_storage/newusers/`
  },
  userrequests: {
    invitation_request_channel: 'G1H574PK7',
    tilde_api_uri: 'https://menadevs.com/api/v1/invitations'
  },
  // Loaded plugins
  plugins: [
    // Core
    path.join('plugins', 'info.js'),
    path.join('plugins', 'help.js'),

    // Other
    path.join('plugins', 'ping.js'),
    path.join('plugins', 'juju.js'),
    path.join('plugins', 'chmod.js'),
    path.join('plugins', 'corona.js'),
    path.join('plugins', 'hackernews.js'),
    path.join('plugins', 'karma.js'),
    path.join('plugins', 'do_figlet.js'),
    path.join('plugins', 'newuser.js'),
    path.join('plugins', 'system.js'),
    path.join('plugins', 'wolframalpha.js'),
    path.join('plugins', 'spellcheck.js'),
    path.join('plugins', 'sentiment.js'),
    path.join('plugins', 'wikipedia.js'),
    path.join('plugins', 'lira.js')
  ]
}

module.exports = config
