const rp = require('request-promise')

const RTM_EVENTS = require('@slack/client').RTM_EVENTS

const winston = require('winston')

const META = {
  name: 'userrequests',
  short: 'Request an invite for a user -- Do not forget the ( ) they are necessary!',
  examples: [
    '@bosta invite (Full Name) (Email) (Occupation) (Company)'
  ]
}

function informUserRequestPending (web, invitee, userID) {
  const msg = `Hey <@${userID}>, \
we have received your invitation request for ${invitee} and the admins are \
currently processing it. I'll keep you posted on \
its status! :wink:`
  web.chat.postMessage(userID, msg, { as_user: true }, (error) => {
    if (error) {
      winston.error(`${META.name} Could not respond to invitation requesting user:`, error)
    } else {
      winston.info('Invitation confirmation message was sent')
    }
  })
}

function informUserRequestApproved (web, invitee, userID) {
  const msg = `Hello again <@${userID}>, \
your invitation request for ${invitee} has been approved. (S)he will receive a confirmation \
email with further instructions. \
Thank you for helping spread the message!`
  web.chat.postMessage(userID, msg, { as_user: true }, (error) => {
    if (error) {
      winston.error(`${META.name} Could not respond to invitation requesting user:`, error)
    } else {
      winston.info('Invitation approval message was sent')
    }
  })
}

function informUserRequestDenied (web, invitee, userID) {
  const msg = `Hello again <@${userID}>, \
I'm afraid that your invitation request for ${invitee} has been denied. This is either because the user has been \
invited already or an admin has rejected the request. If it's the latter an admin will be in touch \
with you soon to clarify the reason.`
  web.chat.postMessage(userID, msg, { as_user: true }, (error) => {
    if (error) {
      winston.error(`${META.name} Could not respond to invitation requesting user:`, error)
    } else {
      winston.info('Invitation rejection message was sent')
    }
  })
}

function processInvitationRequest (invitationRequestObj, web, config, secret) {
  const options = {
    method: 'POST',
    uri: `${config.plugins.userrequests.menadevs_api_uri}?auth_token=${secret.menadevs_api_token}`,
    body: {
      invitation: invitationRequestObj
    },
    json: true,
    simple: false,
    resolveWithFullResponse: true
  }

  rp(options)
    .then(function (response) {
      if (response.statusCode == 201) {
        informUserRequestApproved(web, invitationRequestObj.invitee_name, invitationRequestObj.slack_uid)
      } else if (response.statusCode == 422) {
        // TODO -- Handle duplicate errors in a separate manner than
        // rejected requests by admins
        informUserRequestDenied(web, invitationRequestObj.invitee_name, invitationRequestObj.slack_uid)
      }
    })
    .catch(function (error) {
      winston.error(`${META.name} Invitation Request -- Failed: `, error)
    })
}

function register (bot, rtm, web, config, secret) {
  rtm.on(RTM_EVENTS.MESSAGE, (message) => {
    if (message.text) {
      const pattern = /<@([^>]+)>:? invite \(([a-zA-Z0-9- ]+)?\) \(([<>a-zA-Z0-9_\-:@|.]+)?\) \((.+[^)])\)? \((.+[^)])\)?/
      const [, target, fullname, email, occupation, company] = message.text.match(pattern) || []

      if (target === bot.self.id) {
        if (fullname.length > 0 && email.length > 0 && occupation.length > 0 && company.length > 0) {
          const timestamp = Math.floor(new Date() / 1000)
          const postChannel = config.plugins.userrequests.invitation_request_channel
          const attachment = {
            as_user: true,
            attachments: [{
              color: '#36a64f',
              author_name: 'Bosta',
              title: 'Invitation Request',
              text: 'Attention Admins',
              fields: [
                {
                  title: 'Requester',
                  value: `<@${message.user}>`,
                  short: false
                },
                {
                  title: 'Full Name',
                  value: `${fullname}`,
                  short: false
                },
                {
                  title: 'Email',
                  value: `${email}`,
                  short: false
                },
                {
                  title: 'Occupation',
                  value: `${occupation}`,
                  short: false
                },
                {
                  title: 'Company',
                  value: `${company}`,
                  short: false
                }
              ],
              footer: 'Automation',
              footer_icon: 'https://platform.slack-edge.com/img/default_application_icon.png',
              ts: timestamp
            }]
          }

          informUserRequestPending(web, fullname, message.user)

          // Notify the admins
          web.chat.postMessage(postChannel, '', attachment, (error) => {
            if (error) {
              winston.error(`Could not post invitation request to ${postChannel}`, error)
            } else {
              winston.info(`Invitation request sent to ${postChannel}`)
            }
          })
        }
      }
    }
  })

  // Wait for the check mark emoji to be added to the message
  // before processing the invitation request
  rtm.on(RTM_EVENTS.REACTION_ADDED, (message) => {
    // Do not process the message if it's not in the admin channel
    if (message.item.channel != config.plugins.userrequests.invitation_request_channel) { return }

    if (message.reaction == 'white_check_mark') {
      web.groups.history(message.item.channel, { latest: message.item.ts, inclusive: true, count: 1 })
        .then((response) => {
          if (response.messages.length < 1) { return {} }

          // TODO: parse the fields in a better way (this is fucking ugly!)
          const messageFields = response.messages[0].attachments[0].fields

          // This is an ugly fix, but the email returned in the message above
          // has the following format: <mailto:email@address.com|email@address.com>
          // so we need to extract the email only from the above
          const cleanEmail = messageFields[2].value.slice(1, -1).split('|')[1]
          const cleanRequesterId = messageFields[0].value.slice(1, -1).split('@')[1]

          return {
            invitee_name: messageFields[1].value,
            invitee_email: cleanEmail,
            invitee_title: messageFields[3].value,
            slack_uid: cleanRequesterId,
            invitee_company: messageFields[4].value
          }
        })
        .then((invitationRequestObj) => {
          processInvitationRequest(invitationRequestObj, web, config, secret)
        })
        .catch((error) => {
          winston.error(`${META.name} - Processing Invitation Error - : ${error}`)
        })
    } else if (message.reaction == 'negative_squared_cross_mark') {
      web.groups.history(message.item.channel, { latest: message.item.ts, inclusive: true, count: 1 })
        .then((response) => {
          if (response.messages.length < 1) { return {} }

          // TODO: parse the fields in a better way (this is fucking ugly!)
          const messageFields = response.messages[0].attachments[0].fields

          // This is an ugly fix, but the email returned in the message above
          // has the following format: <mailto:email@address.com|email@address.com>
          // so we need to extract the email only from the above
          const cleanEmail = messageFields[2].value.slice(1, -1).split('|')[1]
          const cleanRequesterId = messageFields[0].value.slice(1, -1).split('@')[1]

          return {
            invitee_name: messageFields[1].value,
            invitee_email: cleanEmail,
            invitee_title: messageFields[3].value,
            slack_uid: cleanRequesterId,
            invitee_company: messageFields[4].value
          }
        })
        .then((invitationRequestObj) => informUserRequestDenied(web, invitationRequestObj.invitee_name, invitationRequestObj.slack_uid))
        .catch((error) => {
          winston.error(`${META.name} - Processing Invitation Error - : ${error}`)
        })
    }
  })
}

module.exports = {
  register,
  META
}
