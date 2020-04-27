var path = require('path');

const config = {

    main: {
        prefix: 'omar',
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
        path.join('plugins', 'ping.js')
    ]

};

module.exports = config;
