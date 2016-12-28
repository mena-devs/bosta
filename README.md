# Bostantine Androidaou

| Branch | Build Status |
| ------ | ----- |
| master |  N/A  |

## Synopsis

[MENA-Devs](http://mena-devs.com)'s Slack Greek Emperor

## Installation & Configuration

### Minimum Requirements

```
NodeJS v6.9.2
```

The code uses ECMAScript 2015 (ES6) *shipping* features. If you're
building/submitting plugins please avoid using staged/in progress features.

### Installatian

You can install and run the bot using the following:

```
$ npm install
```

### Configure and Run

Retrieve your bot token from slack and create a `secret.json` file as follows:

```
{
    "token": "your-bot-token-here"
}
```

then start the bot using

```
$ npm start
```

Plugins may have their own installation requirements that are covered as part
of the plugin's own documentation.

## Available Plugins

### Ping

Simple ping/pong handler; you can change the text in the configuration file.

### Wikipedia

Fetches the _extract_ of a search from wikipedia and only displays the first
line. You can configure the amount of text displayed in the configuration file.

### Figlet

Displays funky text.

### Snippets

The snippets plugin is capable of executing user submitted snippets and report
back the results:

#### How to use?

- When a user _shares_ a snippet and sets the language, if the bot supports
that language, it will execute it and report back the result as a comment on
the snippet itself.
- The bot would also execute subsequent shares of the same snippet (changed or
otherwise).
- The user is capable of using the `:repeat:` emoji as a reaction to force a
re-evaluation of the snippet.
- You can check the language support using `snippets support`
- You can check the language configuration using `snippets config <lang>`

#### What are the concerns?

- Is it safe? Yes, it's very safe; The bot uses containers to execute the
snippets and as such your system is protected (hopefully, for the most part).
- What about memory? The plugin allows you to control how much memory is
allocated for every container/language.
- What about infinite/long running operations? The plugin allows you to control
the timeout for every container/language

#### Dependencies

System the snippet executor is heavily dependant on Docker, you will need to
ensure that you have a working docker configuration. The bot was tested against
the following versions:

```
Docker version 1.11.2
docker-machine version 0.7.0
```

#### Configuration

In order to allow the bot to execute commands, you need to make sure that you
have the corresponding docker images specified in `config.json`:

```
"python": {
    "command": "python",
    "image": "python:latest",
    "memory": 8,
    "timeout": 4
}
```

Simply install the proper image (in the example above `docker pull python:latest`)

## Contributing

We would very much appreciate any and all contributions for this project. Nevertheless, in order for us to manage this repository efficiently, please review and abide by the contribution guidelines detailed in this document: [CONTRIBUTING.md](https://github.com/mena-devs/slack_data_collector/blob/master/CONTRIBUTING.md) before pushing your changes.
