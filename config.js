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
            handleExceptions: true,
        },
    },


    plugins: [
        // Core
        path.join('plugins', 'auth.js'),
        path.join('plugins', 'help.js'),

        // Other
        path.join('plugins', 'ping.js'),
        path.join('plugins', 'juju.js'),
    ],

};

module.exports = config;
