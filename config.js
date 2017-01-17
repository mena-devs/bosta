const config = {
    plugins: {
        tellmeabout: {
            path: 'data/storage.txt',
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
                    image: 'mhart/alpine-node:latest',
                    memory: 8,
                    timeout: '-t 4',
                },
                perl: {
                    command: 'perl',
                    image: 'python:latest',
                    memory: 8,
                    timeout: 4,
                },
                php: {
                    command: 'php',
                    image: 'matriphe/alpine-php:cli',
                    memory: 8,
                    timeout: '-t 4',
                },
                python: {
                    command: 'python',
                    image: 'frolvlad/alpine-python2:latest',
                    memory: 8,
                    timeout: '-t 4',
                },
                ruby: {
                    command: 'ruby',
                    image: 'frolvlad/alpine-ruby:latest',
                    memory: 8,
                    timeout: '-t 4',
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
