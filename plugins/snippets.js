const crypto = require('crypto');
const fs = require('fs');
const https = require('https');
const spawn = require('child_process').spawn;
const url = require('url');

const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const winston = require('winston');

const pre = require('../utils.js').pre;
const Plugin = require('../utils.js').Plugin;

const META = {
  name: 'snippets',
  short: 'runs user submitted code',
  examples: [
    'simply create a snippet and set the language that the bot understands, see next for additional.',
    'snippets support',
    'snippets config python'
  ]
};

function download(host, path, token) {
  const options = {
    host,
    path,
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  return new Promise((resolve, reject) => {
    https
      .get(options, (res) => {
        resolve(res);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

function save(path, sourceStream) {
  return new Promise((resolve, reject) => {
    const targetStream = fs.createWriteStream(path);
    sourceStream.pipe(targetStream);

    targetStream
      .on('finish', () => {
        resolve(path);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

function execute(name, config, sourceFolder) {
  let timeout = [config.timeout];

  if (typeof config.timeout === 'string') {
    timeout = config.timeout.split(' ');
  }

  const dockerArgs = [
    'run',
    '--rm',
    '--net',
    'none',
    '-m',
    `${config.memory}M`,
    '-w',
    '/local',
    '-v',
    `${sourceFolder}:/local:ro`,
    config.image,
    'timeout',
    ...timeout,
    config.command,
    name
  ];

  return new Promise((resolve) => {
    const docker = spawn('docker', dockerArgs);
    let output = '';
    let error = '';
    docker.stdout.on('data', (data) => {
      output += data.toString();
    });

    docker.stderr.on('data', (data) => {
      error += data.toString();
    });

    docker.on('close', (code) => {
      const replaced = output.split('\n').join(';');
      const result = [replaced || error];

      if (code > 0) {
        result.push(`Your snippet failed with exit code: ${code}`);
      }

      resolve(result.join('\n'));
    });
  });
}

function loadConfig(config, name) {
  const language = config.plugins.snippets.languages[name];
  return {
    timeout: language.timeout || config.plugins.snippets.timeout,
    crop: language.crop || config.plugins.snippets.crop,
    memory: language.memory || config.plugins.snippets.memory,
    image: language.image,
    command: language.command
  };
}

function runSnippet(web, rtm, config, secret, message, file) {
  const fileName = crypto.randomBytes(4).toString('hex');
  const { host, path } = url.parse(file.url_private_download);
  const language = loadConfig(config, file.filetype);

  const sourceFolder = `${__dirname}/${config.plugins.snippets.folder}`;
  const fileOnDisk = `${sourceFolder}/${fileName}`;

  download(host, path, secret.token)
    .then((response) => save(fileOnDisk, response))
    .then(() => execute(fileName, language, sourceFolder))
    .then((text) => message.reply(pre(text.slice(0, language.crop))))
    .catch((error) => {
      message.reply(error);
      winston.error(`${META.name} - Error: ${error}`);
    });

  web.reactions.add('repeat', { file: file.id }).catch(() => {}); // bot already reacted supposedly
}

function supported(options, message) {
  const languages = Object.keys(options.config.plugins.snippets.languages).join(
    ', '
  );

  message.reply(`I can run: ${languages}`);
}

function langConfig(options, message, lang) {
  try {
    const { timeout, crop, memory } = loadConfig(options.config, lang);

    message.reply(
      pre(`${lang}:
    Timeout  : ${timeout} seconds
    Memory   : ${memory}MB
    Crops at : ${crop} characters`)
    );
  } catch (e) {
    message.reply(pre(`${lang} is not supported`));
  }
}

function register(bot, rtm, web, config, secret) {
  const plugin = new Plugin({ bot, rtm, web, config });
  plugin.route(/^snippets support/, supported, {});
  plugin.route(/^snippets config (.*)/, langConfig, {});

  rtm.on(RTM_EVENTS.MESSAGE, (message) => {
    if (
      message.files !== undefined &&
      message.files.length > 0 &&
      message.files[0].mode === 'snippet' &&
      // This is gone?
      // && message.subtype === 'file_share'
      config.plugins.snippets.languages[message.files[0].filetype]
    ) {
      runSnippet(web, rtm, config, secret, message, message.files[0]);
    }
  });

  rtm.on(RTM_EVENTS.REACTION_ADDED, (message) => {
    if (
      message.user !== bot.self.id &&
      message.item.type === 'file' &&
      message.reaction === 'repeat'
    ) {
      web.files
        .info(message.item.file)
        .then((result) => runSnippet(web, rtm, config, secret, result.file));
    }
  });
}

module.exports = {
  register,
  META
};
