const crypto = require('crypto');
const url = require('url');

const WebClient = require('@slack/client').WebClient;
const RtmClient = require('@slack/client').RtmClient;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

const figlet = require('figlet');
const winston = require('winston');

const config = require('./config.json');
const utils = require('./utils.js');

const client = new RtmClient(config.token);
const web = new WebClient(config.token);

let BOT_ID = '';


function runSnippet(file) {
    // Provide a random name for files without one (-.x) gives errors
    let fileName = file.name;
    if (fileName.startsWith('-.')) {
        fileName = crypto.randomBytes(4).toString('hex');
    }

    const reply = text => web.files.comments.add(file.id, text);
    const { host, path } = url.parse(file.url_private_download);
    const language = utils.loadConfig(config, file.filetype);

    const fileOnDisk = `${config.plugins.eval.folder}/${fileName}`;
    const sourceFolder = `${__dirname}/${config.plugins.eval.folder}`;

    utils.download(host, path, config.token)
        .then(response => utils.save(fileOnDisk, response))
        .then(() => utils.execute(fileName, language, sourceFolder))
        .then(text => reply(`\`\`\`${text}\`\`\``))
        .catch((error) => {
            reply(error);
            winston.error(error);
        });

    web.reactions.add('repeat', { file: file.id })
        .catch(() => {}); // bot already reacted supposedly
}


client.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (data) => {
    BOT_ID = data.self.id;
    winston.info(`Logged in as ${data.self.name} (${data.self.id}) of team ${data.team.name}`);
});


client.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
    winston.info('RTM Connected');
});


client.on(RTM_EVENTS.MESSAGE, (message) => {
    // PING
    if (message.text === 'test') {
        winston.info(
            `${message.user} pinged on channel ${message.channel}`, message);
        client.sendMessage('icle', message.channel);
    }

    // FIGLET
    if (message.text
            && message.text.startsWith('figlet')) {
        const text = message.text.substring(7);
        figlet(text, (err, data) => {
            if (err) {
                winston.error(err);
            } else {
                client.sendMessage(`\`\`\`${data}\`\`\``, message.channel);
            }
        });
    }

    // Snippets
    if (message.text
            && message.text === 'snippets support') {
        winston.info(`support request: ${message}`);
        const languages = Object.keys(config.plugins.eval.languages).join(', ');
        client.sendMessage(`I can run: ${languages}`, message.channel);
    }

    if (message.text
            && message.text.startsWith('snippets config')) {
        const name = message.text.split(' ').pop();
        winston.info(`config request: ${name}`);
        const { timeout, crop, memory } = utils.loadConfig(config, name);
        client.sendMessage(`\`\`\`${name}:
    Timeout  : ${timeout} seconds
    Memory   : ${memory}MB
    Crops at : ${crop} characters\`\`\``, message.channel);
    }

    if (message.file
            && message.file.mode === 'snippet'
            && message.subtype === 'file_share') {
        if (config.plugins.eval.languages[message.file.filetype]) {
            winston.info(`snippet execution request: ${message.user} - ${message.file.filetype} - ${message.file.url_private_download}`);
            runSnippet(message.file);
        }
    }
});

client.on(RTM_EVENTS.REACTION_ADDED, (message) => {
    if (message.user !== BOT_ID
            && message.item.type === 'file'
            && message.reaction === 'repeat') {
        winston.info(`repeat request: ${message.item.file}`);
        web.files.info(message.item.file)
            .then(result => runSnippet(result.file));
    }
});


client.start();
