const path = require('path');

const { createServer } = require('http');
const express = require('express');

const { WebClient } = require('@slack/web-api');
const { createEventAdapter } = require('@slack/events-api');
const { createMessageAdapter } = require('@slack/interactive-messages');

const logger = require('./logging.js');
const secret = require('./secret.json');
const config = require('./config.js');
const utils = require('./utils.js');

const signingSecret =
  process.env.SLACK_SIGNING_SECRET || secret.slack_signing_secret;

const slackEventsAdapter = createEventAdapter(signingSecret);
const slackInteractionAdapter = createMessageAdapter(signingSecret);
const web = new WebClient(secret.token);

const plugins = config.plugins.map((pluginPath) => {
  const filename = path.resolve(pluginPath);
  const module = require(filename);

  Object.entries(module.events).forEach(([name, func]) => {
    const listener = (payload) =>
      func({ logger, web }, utils.patch(web, payload));
    slackEventsAdapter.on(name, listener);
  });

  return module;
});

// Unlike events, interactions do not suppot multiple listeners
// We have to use a single listener instead
slackInteractionAdapter.action({}, (payload, respond) => {
  plugins
    .filter((p) => p.actions)
    .forEach((plugin) => {
      plugin.actions({ logger, web }, payload, respond);
    });
});

const app = express();
app.use('/slack/events', slackEventsAdapter.requestListener());
app.use('/slack/interactive', slackInteractionAdapter.requestListener());

const server = createServer(app);
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Listening for events on ${server.address().port}`);
});
