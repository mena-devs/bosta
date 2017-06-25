# Bostantine Androidaou

## Synopsis

[MENA-Devs](http://mena-devs.com)'s Slack Greek Emperor

## Installation & Configuration

### Minimum Requirements

```
NodeJS v6.9.2
```

The code uses ECMAScript 2015 (ES6) *shipping* features. If you're
building/submitting plugins please avoid using staged/in progress features.

### Configure and Run

Install the dependencies using:

```
$ npm install
```

Retrieve your bot token and add a custom incoming webhook (if winston is enabled in your configuration file) from slack and create a `secret.json` file as follows:

```
{
    "winston_webhook": "webhook-url-here",
    "token": "your-bot-token-here",
    "menadevs_api_token": "this is a token specific to MENA Devs purposes",
    "wolframalpha_app_id": "APP_ID"
}
```

then start the bot using

```
$ npm start
```

Plugins may have their own installation requirements that are covered as part
of the plugin's own documentation.

Alternatively, you can build and run bosta through docker. Simply make sure your `secret.json` is available and run the following commands:

```
$ docker build -t bosta:latest .
$ docker run --rm -ti bosta:latest
```

## Available Plugins

### Ping

Simple ping/pong handler; you can change the text in the configuration file.

### Wikipedia

Fetches the _extract_ of a search from wikipedia and only displays the first
line. You can configure the amount of text displayed in the configuration file.

### Figlet

Displays funky text.

### Sentiment Analysis

Provides sentiment analysis over a user's last N-messages. The plugin uses
[DatumBox's Sentiment Analysis API](http://www.datumbox.com/api-sandbox/#!/Document-Classification/SentimentAnalysis_post_0)
 and you must provide the API key in your `secret.json`:

```json
{
    ...
    "datumbox": "api-token-here"
}
```

### Spell Checker

This plugin will automatically check the spelling of words that are followed
by `(sp?)`. Example:

```
John: This may end up being idiocyncracy(sp?). What did you see?
Bosta: possible spelling for idiosyncracy: idiosyncrasy, idiosyncratic, ...
```

### Tell-Me-About

A rudimentary, persistent, user-configured responder. It's purpose is to allow
users to configure shortcuts to commonly used text. Example:

```
John: @bosta save sscce as: Short, Self Contained, Correct, Example. Read more
about it here http://sscce.org/
bosta: sscce saved.
John: about sscce
bosta: sscce: Short, Self Contained, Correct, Example. Read more
about it here http://sscce.org/
```

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

- Is it safe? Yes, it's very safe; the bot uses containers to execute the
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

### User Requests

This plugin takes a request from any MENA Devs member and pushes it to assigned admins for action.

#### Supported Requests

- Invitation request

### Hacker News

Retrieves up to (N) top stories from YCombinator's Hacker News

### New User

Manually triggered command to send a greeting to any member and push the MENA Dev's Code of Conduct to them in a private message sent by the Bot.

## Contributing

We would very much appreciate any and all contributions for this project. Nevertheless, in order for us to manage this repository efficiently, please review and abide by the contribution guidelines detailed in this document: [CONTRIBUTING.md](https://github.com/mena-devs/slack_data_collector/blob/master/CONTRIBUTING.md) before pushing your changes.
