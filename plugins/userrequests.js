const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

const winston = require('winston');

const META = {
    name: 'userrequests',
    short: 'Request an invite for a user',
    examples: [
        '@bosta invite (Full Name) (Email) (Occupation)',
    ],
};

function register(bot, rtm, web) {
    rtm.on(RTM_EVENTS.MESSAGE, (message) => {
        if (message.text) {
            const pattern = /<@([^>]+)>:? invite \(([a-zA-Z0-9 ]+)?\) \(([<>a-zA-Z0-9_-:@|.]+)?\) \((.+[^)])\)?/;
            const [, target, fullname, email, occupation] = message.text.match(pattern) || [];

            if (target === bot.self.id) {
                if (fullname.length > 0 && email.length > 0 && occupation.length > 0) {
                    const attachment = {
                        as_user: true,
                        attachments: [
                            {
                                color: '#36a64f',
                                author_name: 'Bosta',
                                title: 'Invitation Request',
                                text: 'Attention Admins',
                                fields: [
                                    {
                                        title: 'Requester',
                                        value: `<@${message.user}>`,
                                        short: false,
                                    },
                                    {
                                        title: 'Full Name',
                                        value: `${fullname}`,
                                        short: false,
                                    },
                                    {
                                        title: 'Email',
                                        value: `${email}`,
                                        short: false,
                                    },
                                    {
                                        title: 'Occupation',
                                        value: `${occupation}`,
                                        short: false,
                                    },
                                ],
                                footer: 'Automation',
                                footer_icon: 'https://platform.slack-edge.com/img/default_application_icon.png',
                                ts: 123456789,
                            },
                        ],
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
                    web.chat.postMessage('#admins', '', attachment, (error) => {
                        if (error) {
                            winston.error('Could not post invitation request to #admins:', error);
                        } else {
                            winston.info('Invitation request sent to #admins');
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
