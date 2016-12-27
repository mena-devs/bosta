const fs = require('fs');
const https = require('https');
const spawn = require('child_process').spawn;


function download(host, path, token) {
    const options = {
        host,
        path,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    return new Promise((resolve, reject) => {
        https.get(options, (res) => {
            resolve(res);
        }).on('error', (error) => {
            reject(error);
        });
    });
}


function save(path, sourceStream) {
    return new Promise((resolve, reject) => {
        const targetStream = fs.createWriteStream(path);
        sourceStream.pipe(targetStream);

        targetStream.on('finish', () => {
            resolve(path);
        }).on('error', (error) => {
            reject(error);
        });
    });
}


function execute(name, config, sourceFolder) {
    const dockerArgs = [
        'run',
        '--rm',
        '-m', `${config.memory}M`,
        '-w', '/local',
        '-v', `${sourceFolder}:/local`,
        config.image,
        'timeout', config.timeout,
        config.command,
        name,
    ];

    return new Promise((resolve) => {
        const docker = spawn('docker', dockerArgs);
        let output = '';
        let error = '';
        docker.stdout.on('data', (data) => {
            output = data.toString();
        });

        docker.stderr.on('data', (data) => {
            error = data.toString();
        });

        docker.on('close', (code) => {
            const result = [output || error];

            if (code > 0) {
                result.push(`Your snippet failed with exit code: ${code}`);
            }

            resolve(result.join('\n'));
        });
    });
}


function loadConfig(config, name) {
    const language = config.plugins.eval.languages[name];
    return {
        timeout: language.timeout || config.plugins.eval.timeout,
        crop: language.crop || config.plugins.eval.crop,
        memory: language.memory || config.plugins.eval.memory,
        image: language.image,
        command: language.command,
    };
}


module.exports = {
    download,
    save,
    execute,
    loadConfig,
};
