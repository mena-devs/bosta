const fs = require('fs');
const https = require('https');
const spawn = require('child_process').spawn;


function download(host, path, token){
    const options = {
        host,
        path,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };

    return new Promise((resolve, reject) => {
        https.get(options, (res) => {
            resolve(res);
        }).on('error', (error) => {
            reject(error);
        });
    });
}


function save(path, source_stream){
    return new Promise((resolve, reject) => {
        let target_stream = fs.createWriteStream(path)
        source_stream.pipe(target_stream);

        target_stream.on('finish', () => {
            resolve(path);
        }).on('error', (error) =>{
            reject(error);
        });
    });
}


function execute(name, config, source_folder){
    const docker_args = [
        'run',
        '--rm',
        '-m', `${config.memory}M`,
        '-w', '/local',
        '-v', `${source_folder}:/local`,
        config.image,
        'timeout', config.timeout,
        config.command,
        name
    ];

    return new Promise((resolve, reject) => {
        let docker = spawn('docker', docker_args);
        let output = '';
        let error = '';
        docker.stdout.on('data', (data) =>{
            output = data.toString();
        });

        docker.stderr.on('data', (data) => {
            error = data.toString();
        });

        docker.on('close', (code) => {
            let result = [output || error];

            if(code > 0)
                result.push(`Your snippet failed with exit code: ${code}`);

            resolve(result.join('\n'));
        });
    });
}


function load_config(config, name) {
    const language = config.plugins.eval.languages[name];
    return {
        timeout: language.timeout || config.plugins.eval.timeout,
        crop: language.crop || config.plugins.eval.crop,
        memory: language.memory || config.plugins.eval.memory,
        image: language.image,
        command: language.command,
    }
}


module.exports = {
    download,
    save,
    execute,
    load_config
};
