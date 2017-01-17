const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

const winston = require('winston');

const META = {
    name: 'userrequests',
    short: 'Request an invite for a user',
    examples: [
        '@bosta invite (Full Name) (Email) (Occupation)',
    ],
};

function register(bot, rtm, web, config) {
    rtm.on(RTM_EVENTS.MESSAGE, (message) => {
        if (message.text) {
            const pattern = /<@([^>]+)>:? invite \(([a-zA-Z0-9 ]+)?\) \(([\<\>a-zA-Z\:\@\|\.]+)?\) \((.+[^)])\)?/;
            const [, target, fullname, email, occupation] = message.text.match(pattern) || [];

            if (target === bot.self.id) {
                if (fullname.length > 0 && email.length > 0 && occupation.length > 0) {
                    var attachment = {
                        "as_user": true,
                        "attachments": [
                            {
                                "color": "#36a64f",
                                "author_name": "Bosta",
                                "title": "Invitation Request",
                                "text": "Attention Admins",
                                "fields": [
                                    {
                                        "title": "Requester",
                                        "value": `<@${message.user}>`,
                                        "short": false
                                    },
                                    {
                                        "title": "Full Name",
                                        "value": `${fullname}`,
                                        "short": false
                                    },
                                    {
                                        "title": "Email",
                                        "value": `${email}`,
                                        "short": false
                                    },
                                    {
                                        "title": "Occupation",
                                        "value": `${occupation}`,
                                        "short": false
                                    },
                                ],
                                "footer": "Automation",
                                "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
                                "ts": 123456789
                            }
                        ]
                    }
                    web.chat.postMessage('#admins', '', attachment, 
                    function(err, res) {
                        if (err) {
                            winston.error('Error:', err);
                        } else {
                            winston.info('Message sent!');
                        }
                    });
                }
            }
        }
    });
}


module.exports = {
    register,
    META,
};
