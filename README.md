# Bostantine Androidaou

> [MENA-Devs](https://menadevs.com/)' Slack Greek Emperor

[![Build Status](https://menadevs.semaphoreci.com/badges/bosta.svg?style=shields)](https://menadevs.semaphoreci.com/projects/bosta)

Pluggable Slack bot that's running the show at MENA Devs' slack workspace. It's designed for ease of use with a simple architecture, and hot reloading of pluggins.

## Installation

```sh
# 1. Install dependencies
npm install

# 2. Rename `secret.json.template` to `secret.json`
mv secret.json.template secret.json

# 3. Start the bot with
npm start
```

We recommend the usage of a process manager if you're planning to deploy Bosta. We are using [pm2](https://pm2.keymetrics.io/) for our setup.

## Slack Configuration

This is where things get a little bit complex, we recommend that you go through [https://api.slack.com/start/building/bolt](https://api.slack.com/start/building/bolt) before you attempt the below so that you get enough context for each of the steps below:

1. Create a slack app: [https://api.slack.com/apps?new_app=1&ref=bolt_start_hub](https://api.slack.com/apps?new_app=1&ref=bolt_start_hub)

2. Give the app the scopes (permissions) below: [https://api.slack.com/apps/A012Y6E2WPQ/oauth?from=docs](https://api.slack.com/apps/A012Y6E2WPQ/oauth?from=docs)

```
app_mentions:read
View messages that directly mention @bostalocalbd in conversations that the app is in

channels:history
View messages and other content in public channels that Bosta.Local.BD has been added to

channels:join
Join public channels in the workspace

channels:read
View basic information about public channels in the workspace

chat:write
Send messages as @bostalocalbd

chat:write.customize
Send messages as @bostalocalbd with a customized username and avatar

chat:write.public
Send messages to channels @bostalocalbd isn't a member of

emoji:read
View custom emoji in the workspace

groups:history
View messages and other content in private channels that Bosta.Local.BD has been added to

im:history
View messages and other content in direct messages that Bosta.Local.BD has been added to

im:read
View basic information about direct messages that Bosta.Local.BD has been added to

im:write
Start direct messages with people

incoming-webhook
Post messages to specific channels in Slack
```

3. Install the app: [https://api.slack.com/start/building/bolt#install](https://api.slack.com/start/building/bolt#install)

4. (Optional) Enable app home: [https://api.slack.com/start/building/bolt#home](https://api.slack.com/start/building/bolt#home)

5. Create an incoming webhook to be used with winston to push logs to a channel: [https://api.slack.com/messaging/webhooks](https://api.slack.com/messaging/webhooks)

6. Enable events subscription by following this guide: [https://api.slack.com/events-api](https://api.slack.com/events-api).

   a. it is required to enter a "Request URL" that is available through the internet in this page. Slack uses this url to send HTTP POST requests when events occur - Details on how to generate this url can be found in the "Local Development" section (e.g. `http://1g0flm41cd32.ngrok.io/slack/events`)

   b. make sure to subscribe to the following events:

   ```
   message.channels
   A message was posted to a channel

   message.im
   A message was posted in a direct message channel
   ```

7. Configure the display information for your bot

8. Update your `secret.json` file with the webhook you created in **step #5**, the OAuth token you got in **step #3**, and the Singing Secret, which can be retrieved from your slack app settings, under "App Credentials" in the Basic information page

```
{
  ...
  "winston_webhook": "https://hooks.slack.com/services/<...>",
  "token": "xoxb-<...>",
  "slack_signing_secret": "..."
  ...
}
```

## Local Development

Obviously when you start with Bosta you will be doing local development. In addition to all the above and for the event subscription to work you will need a URL that is available through the internet. You will not get that just by running bosta locally.

You have 2 options:

1. Use [https://ngrok.com/](https://ngrok.com/)
2. Setup a reverse proxy with ssh tunneling through your own publicly available server

- **Option #1**: is easy and fast but if you're using the free version of ngrok, everytime you terminate the process a new URL is generated and you need to update the slack configuration and verify the new URL again.

- **Option #2**: is more complicated to setup but offers a long term solution where your URL does not expire.

- **Option #3**: is of course to purchase a license for ngrok which will solve the temporary URL problem.

## Available Plugins

- Ping

  - Simple ping/pong handler.
  - [Docs](./docs/ping.md)

- Wikipedia

  - Fetches the _extract_ of a search from wikipedia and only displays the first line.
  - [Docs](./docs/wikipedia.md)

- Figlet

  - Generate text banners out of smaller ASCII characters.
  - [Docs](./docs/figlet.md)

- Sentiment Analysis

  - Provides sentiment analysis over a user's last N-messages.
  - [Docs](./docs/sentiment_analysis.md)

- Spell Checker

  - Automatically check the spelling of words that are followed by `(sp?)`
  - [Docs](./docs/spell_checker.md)

- Tell-Me-About

  - A rudimentary, persistent, user-configured responder. It's purpose is to allow users to configure shortcuts to commonly used text.
  - [Docs](./docs/tell_me_about.md)

- Snippets

  - The snippets plugin is capable of executing user submitted code and report back the results.
  - [Docs](./docs/snippets.md)

- User Requests

  - Takes a invite request from any MENA Devs member and pushes it to assigned admins for approval / rejection.
  - [Docs](./docs/user_requests.md)

- Hacker News

  - Fetches up to (N) top stories from YCombinator's Hacker News.
  - [Docs](./docs/hacker_news.md)

- New User MOTD

  - Send a greeting to new members and push the MENA Dev's Code of Conduct to them in a private message.
  - [Docs](./docs/new_user_motd.md)

- Lira

  - Fetches the latest LBP/USD rate
  - [Docs](./docs/lira.md)

- Corona

  - Fetches the latest statistics around the spread of COVID-19.
  - [Docs](./docs/corona.md)

- Wolfram|Alpha

  - Integrates with the computational knowledge engine Wolfram Alpha. Used to answer a variety of calculable questions.
  - [Docs](./docs/wolfram_alpha.md)

- Karma

  - Manages virtual points that can be given to a user as symbolic appreciation for a contribution in the community.
  - [Docs](./docs/karma.md)

- System Commands
  - System and telemetry commands to monitor and manage the bot remotely.
  - [Docs](./docs/system_commands.md)

## Contributing

We would very much appreciate any and all contributions for this project. Nevertheless, in order for us to manage this repository efficiently, please review and abide by the contribution guidelines detailed in this document: [CONTRIBUTING.md](./CONTRIBUTING.md) before pushing your changes.

This project does not require a Contributor License Agreement.

## Frequent Problems

### RequestError: Error: unable to get local issuer certificate

This error pops up because the API provider has a misconfigured SSL certificate. At the moment there are no plans to change providers. The following is a workaround until the issue is permanently resolved:

```
# Run bosta with the flag: NODE_TLS_REJECT_UNAUTHORIZED
env NODE_TLS_REJECT_UNAUTHORIZED=0 \
    DEBUG=true \
    npm start
```

## Meta

Distributed under the Apache 2.0 license. See [LICENSE](./LICENSE) for more information.
