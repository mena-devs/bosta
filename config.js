const config = {
    main: {
        general_chan_id: 'C03B400RU',
        bot_test_chan_id: 'C1X3769UJ',
    },

    winston: {
        enabled: true,
        channel: '#bot-log',
        username: 'Bosta',
        level: 'info',
        handleExceptions: true,
    },

    plugins: {

        newuser: {
            max_recent_users: 10,
        },

        userrequests: {
            invitation_request_channel: 'G1H574PK7',
            menadevs_api_uri: 'https://menadevs.com/api/v1/invitations',
        },

        system: {
            recent_members_path: 'data/recent_members.txt',
            recent_members_key: 'recent_users',
            karma_log_path: 'data/karma_log.txt',
        },

        tellmeabout: {
            path: 'data/storage.txt',
            max_key_length: 128,
            max_value_length: 512,
        },

        sentiment: {
            recent: 10,
        },

        snippets: {
            timeout: 4,
            memory: 8,
            crop: 512,
            folder: 'eval',
            languages: {
                haskell: {
                    command: 'runghc',
                    image: 'mchakravarty/ghc-7.10.2:latest',
                    memory: 16,
                    timeout: 8,
                },
                javascript: {
                    command: 'node',
                    image: 'bosta/javascript:latest',
                    memory: 8,
                    timeout: 4,
                },
                perl: {
                    command: 'perl',
                    image: 'python:latest',
                    memory: 8,
                    timeout: 4,
                },
                php: {
                    command: 'php',
                    image: 'bosta/php:latest',
                    memory: 8,
                    timeout: 4,
                },
                python: {
                    command: 'python',
                    image: 'bosta/python:latest',
                    memory: 8,
                    timeout: 4,
                },
                ruby: {
                    command: 'ruby',
                    image: 'bosta/ruby:latest',
                    memory: 8,
                    timeout: 4,
                },
                scala: {
                    command: 'scala',
                    image: 'williamyeh/scala:latest',
                    memory: 64,
                    timeout: 10,
                },
            },
        },
    },
};

module.exports = config;
