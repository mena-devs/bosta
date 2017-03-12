const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

const winston = require('winston');

const META = {
    name: 'userrequests',
    short: 'Request an invite for a user -- Do not forget the ( ) they are necessary!',
    examples: [
        '@bosta invite (Full Name) (Email) (Occupation)',
    ],
};

function register(bot, rtm, web, config) {
    rtm.on(RTM_EVENTS.MESSAGE, (message) => {
        if (message.text) {
            const pattern = /<@([^>]+)>:? invite \(([a-zA-Z0-9 ]+)?\) \(([<>a-zA-Z0-9_\-:@|.]+)?\) \((.+[^)])\)?/;
            const [, target, fullname, email, occupation] = message.text.match(pattern) || [];

            if (target === bot.self.id) {
                if (fullname.length > 0 && email.length > 0 && occupation.length > 0) {
                    const timestamp = Math.floor(new Date() / 1000);
                    const postChannel = config.plugins.userrequests.invitation_request_channel;
                    const attachment = {
                        as_user: true,
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
                                }
                            ],
                            "footer": "Automation",
                            "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
                            "ts": timestamp,
                            "actions": [
                                {
                                    "name": "approve",
                                    "text": "Approve",
                                    "type": "button",
                                    "value": "approve"
                                },
                                {
                                    "name": "reject",
                                    "text": "Reject",
                                    "type": "button",
                                    "value": "reject",
                                    "style": "danger",
                                    "confirm": {
                                            "title": "Are you sure?",
                                            "text": "This information is not stored anywhere and the invitation request will be lost!",
                                            "ok_text": "Yes",
                                            "dismiss_text": "No"
                                    }
                                }
                            ]
                        }]
                    };
                    // Inform the user that her request is being processed
                    const msg = `Hey <@${message.user}>, \
we have received your invitation request for ${fullname} and the admins are \
currently processing it. I'll keep you posted on \
its status! :wink:`;
                    web.chat.postMessage(message.user, msg, { as_user: true }, (error) => {
                        if (error) {
                            winston.error('Could not respond to invitation requesting user:', error);
                        } else {
                            winston.info('Invitation confirmation message was sent');
                        }
                    });
                    // Notify the admins
                    // TODO: Replace #admins with the variable from config
                    web.chat.postMessage(postChannel, '', attachment, (error) => {
                        if (error) {
                            winston.error(`Could not post invitation request to ${postChannel}`, error);
                        } else {
                            winston.info(`Invitation request sent to ${postChannel}`);
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
