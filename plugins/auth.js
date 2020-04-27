const config = require('../config.js');

module.exports = {
    name: 'auth',
    help: 'Plugin: Bot Auth',

    events: {
        authenticated: (options, payload) => {
            options.logger.info(`
                Team: ${payload.team.name}
                | Name: ${payload.self.name}
                | Prefix: ${config.main.prefix}
            `);
        }
    }
}
