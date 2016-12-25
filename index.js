const fs = require('fs');
const https = require('https');
const spawn = require('child_process').spawnSync;
const url = require('url');

const  WebClient = require('@slack/client').WebClient;
const RtmClient = require('@slack/client').RtmClient;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

const config = require('./config.json');

const client = new RtmClient(config.token);
const web = new WebClient(config.token);

client.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (data) => {
  console.log(`=> Logged in as ${data.self.name} of team ${data.team.name}`);
});

client.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
    console.log('=> RTM Connected');
});


client.on(RTM_EVENTS.MESSAGE, (message) => {
    console.log('=> Received: Message:', message);
    if(message.text === 'test') {
        client.sendMessage('icle', message.channel);
    }

    if(message.text && message.text.toLocaleLowerCase() === 'snippet support') {
        client.sendMessage(
                `I can run: ${Object.keys(config.plugins.eval.languages).join(', ')}`,
                message.channel);
    }

    if(message.file
            && message.file.mode === 'snippet'
            && message.subtype === 'file_share'){
        if(config.plugins.eval.languages[message.file.filetype])
            download(message.file);
    }
});

function download(file){
    const reply = (text) => web.files.comments.add(file.id, text);
    parsed = url.parse(file.url_private_download);
    options = {
        host: parsed.host,
        path: parsed.path,
        headers: {
            'Authorization': `Bearer ${config.token}`
        }
    };

    const file_on_disk = `${config.plugins.eval.folder}/${file.name}`;
    let stream = fs.createWriteStream(file_on_disk);
    https.get(options, (res) => {
        res.pipe(stream);

        stream.on('finish', () => {
            console.log(stream);
            let child = spawn(
                    'docker', [
                    'run',
                    '--rm',
                    '-w', '/local',
                    '-v', `${__dirname}/${config.plugins.eval.folder}:/local`,
                    config.plugins.eval.languages[file.filetype].image,
                    'timeout', config.plugins.eval.languages[file.filetype].timeout,
                    config.plugins.eval.languages[file.filetype].command,
                    file.name]);
            const stdout = child.stdout.toString().slice(0, 512);
            const stderr = child.stderr.toString();
            const answer = stderr
                    || stdout
                    || "Nothing, may have timed out, try logging out anything";
            reply(`\`\`\`${answer}\`\`\``);

        });

    }).on('error', (e) => {
        console.error(e);
    });
}

client.start();


//"c": { "image": "python:latest", "command": "/bin/bash -c \"rm -f a.out 2> /dev/null && gcc -o a.out script.c && ./a.out\""},
