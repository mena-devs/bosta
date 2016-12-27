const fs = require('fs');
const https = require('https');
const spawn = require('child_process').spawnSync;
const url = require('url');

const WebClient = require('@slack/client').WebClient;
const RtmClient = require('@slack/client').RtmClient;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

const figlet = require('figlet');

const winston = require('winston');

const config = require('./config.json');

const client = new RtmClient(config.token);
const web = new WebClient(config.token);


client.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (data) => {
  winston.info(`Logged in as ${data.self.name} of team ${data.team.name}`);
});


client.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
    winston.info('RTM Connected');
});


client.on(RTM_EVENTS.MESSAGE, (message) => {
    // PING
    if(message.text === 'test') {
        winston.info(
            `${message.user} pinged on channel ${message.channel}`, message);
        client.sendMessage('icle', message.channel);
    }

    // FIGLET
    if(message.text
            && message.text.startsWith('figlet')){
        const text = message.text.substring(7);
        figlet(text, function(err, data) {
            if (err) {
                winston.error(err);
            }else{
                client.sendMessage(`\`\`\`${data}\`\`\``, message.channel);
            }
        });
    }

    // Snippets
    if(message.text
            && message.text === 'snippets support') {
        winston.info(`support request: ${message}`);
        const languages = Object.keys(config.plugins.eval.languages).join(', ');
        client.sendMessage(`I can run: ${languages}`, message.channel);
    }

    if(message.text
            && message.text.startsWith('snippets config')){
        winston.info(`config request: ${message}`);
        const name = message.text.split(' ').pop();
        const language = config.plugins.eval.languages[name];
        const {timeout, crop, memory} = load_config(language);
        client.sendMessage(`\`\`\`${name}:
    Timeout  : ${timeout} seconds
    Memory   : ${memory}MB
    Crops at : ${crop} characters\`\`\``, message.channel);
    }

    if(message.file
            && message.file.mode === 'snippet'
            && message.subtype === 'file_share'){
        if(config.plugins.eval.languages[message.file.filetype]){
            winston.info(`snippet execution request: ${message.user} - ${message.file.filetype} - ${message.file.url_private_download}`);
            download(message.file);
        }
    }
});

client.on(RTM_EVENTS.REACTION_ADDED, (message) => {
    if(message.item.type === 'file' && message.reaction == 'repeat'){
        winston.info(`repeat request: ${message.item.file}`);
        web.files.info(message.item.file)
            .then(result => download(result.file));
    }
});


function download(file){
    const reply = (text) => web.files.comments.add(file.id, text);
    const parsed = url.parse(file.url_private_download);
    options = {
        host: parsed.host,
        path: parsed.path,
        headers: {
            'Authorization': `Bearer ${config.token}`
        }
    };

    const language = config.plugins.eval.languages[file.filetype];
    const {timeout, crop, memory} = load_config(language);

    const file_on_disk = `${config.plugins.eval.folder}/${file.name}`;
    let stream = fs.createWriteStream(file_on_disk);
    https.get(options, (res) => {
        res.pipe(stream);
        const docker_args = [
            'run',
            '--rm',
            '-m', `${memory}M`,
            '-w', '/local',
            '-v', `${__dirname}/${config.plugins.eval.folder}:/local`,
            language.image,
            'timeout', timeout,
            language.command,
            file.name
        ];

        stream.on('finish', () => {
            let child = spawn('docker', docker_args);
            const crop = config.plugins.eval.language
            const stdout = child.stdout.toString().slice(0, crop);
            const stderr = child.stderr.toString();
            const answer = stderr
                    || stdout
                    || "Nothing, may have timed out, try logging out anything";
            reply(`\`\`\`${answer}\`\`\``);

        });

    }).on('error', (e) => {
        winston.error(e);
    });
}

function load_config(language) {
    return {
        timeout: language.timeout || config.plugins.eval.timeout,
        crop: language.crop || config.plugins.eval.crop,
        memory: language.memory || config.plugins.eval.memory
    }
}

client.start();
