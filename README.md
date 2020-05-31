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

## Slack Configuration Guide

TBD

## Available Plugins

- Ping
  - Simple ping/pong handler.
  - [Docs](./Docs/ping.md)

- Wikipedia
  - Fetches the _extract_ of a search from wikipedia and only displays the first line.
  - [Docs](./Docs/wikipedia.md)

- Figlet
  - Generate text banners out of smaller ASCII characters.
  - [Docs](./Docs/figlet.md)

- Sentiment Analysis
  - Provides sentiment analysis over a user's last N-messages.
  - [Docs](./Docs/sentiment_analysis.md)

- Spell Checker
  - Automatically check the spelling of words that are followed by `(sp?)`
  - [Docs](./Docs/spell_checker.md)

- Tell-Me-About
  - A rudimentary, persistent, user-configured responder. It's purpose is to allow users to configure shortcuts to commonly used text.
  - [Docs](./Docs/tell_me_about.md)

- Snippets
  - The snippets plugin is capable of executing user submitted code and report back the results.
  - [Docs](./Docs/snippets.md)

- User Requests
  - Takes a invite request from any MENA Devs member and pushes it to assigned admins for approval / rejection.
  - [Docs](./Docs/user_requests.md)

- Hacker News
  - Fetches up to (N) top stories from YCombinator's Hacker News.
  - [Docs](./Docs/hacker_news.md)

- New User MOTD
  - Send a greeting to new members and push the MENA Dev's Code of Conduct to them in a private message.
  - [Docs](./Docs/new_user_motd.md)

- Lira
  - Fetches the latest LBP/USD rate
  - [Docs](./Docs/lira.md)

- Corona
  - Fetches the latest statistics around the spread of COVID-19.
  - [Docs](./Docs/corona.md)

- Wolfram|Alpha
  - Integrates with the computational knowledge engine Wolfram Alpha. Used to answer a variety of calculable questions.
  - [Docs](./Docs/wolfram_alpha.md)

- Karma
  - Manages virtual points that can be given to a user as symbolic appreciation for a contribution in the community.
  - [Docs](./Docs/karma.md)

- System Commands
  - System and telemetry commands to monitor and manage the bot remotely.
  - [Docs](./Docs/system_commands.md)

## Contributing

We would very much appreciate any and all contributions for this project. Nevertheless, in order for us to manage this repository efficiently, please review and abide by the contribution guidelines detailed in this document: [CONTRIBUTING.md](./CONTRIBUTING.md) before pushing your changes.

This project does not require a Contributor License Agreement.

## Meta

Distributed under the Apache 2.0 license. See [LICENSE](./LICENSE) for more information.