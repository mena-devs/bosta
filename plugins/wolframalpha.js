const WolframAlphaAPI = require('@dguttman/wolfram-alpha-api');
const match = require('@menadevs/objectron');
const secret = require('../secret.json');
const { Blocks, Section, Image, Divider, Markdown } = require('../blocks');

const verbose = `
How to use this plugin:

    wa integrate 2x
    wa pi to 100 digits
    wa height of the Eiffel tower
`;

const wolfram = WolframAlphaAPI(secret.wolframalpha_app_id);

/**
 * Builds a blocks response in accordance with Slack's API
 * for a cleaner UI: https://api.slack.com/block-kit
 *
 * @param {*} response
 */
function buildBlocks(response) {
  if (!response.success) {
    return Blocks(Section(Markdown('Could not compute your query.')));
  }

  const blocks = Blocks(
    Section(Markdown(':wolframalpha: *Wolfram|Alpha Output:* :success:')),
    Divider()
  );
  response.pods.forEach((pod) => {
    blocks.push(Section(Markdown(`*${pod.title}*`)));
    pod.subpods.forEach((subpod) => {
      // Display the image only if there's no plain text alternative
      if (subpod.img && !subpod.img.title) {
        blocks.push(Image(subpod.img.src, subpod.img.alt));
      } else if (subpod.img.title) {
        blocks.push(Section(Markdown(`\`\`\`${subpod.img.title}\`\`\``)));
      }
    });
  });
  return JSON.stringify(blocks);
}

/**
 * Dispatches query to Wolfram|Alpha using their REST API
 * and returns a custom message to the user in a thread
 *
 * @param {*} message
 * @param {*} groups
 * @param {*} options
 */
function wa(message, groups, options) {
  return wolfram
    .getFull({
      input: groups.query,
      output: 'json'
    })
    .then((response) => {
      return buildBlocks(response);
    })
    .then((blocks) => {
      message.reply_blocks('ABC', blocks);
    })
    .catch((error) => options.logger.error(`${module.exports.name}: ${error}`));
}

const events = {
  message: (options, message) => {
    match(
      message,
      {
        type: 'message',
        text: /^wa (?<query>.+[^)])?/
      },
      (result) => wa(message, result.groups, options)
    );
  }
};

module.exports = {
  name: 'wolframalpha',
  help: "Run a computation using WolframAlpha's API",
  verbose,
  events
};
