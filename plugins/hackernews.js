const rp = require('request-promise');
const match = require('@menadevs/objectron');
const { Blocks, Section, Fields, Divider, Markdown } = require('../blocks.js');

const verbose = `
How to use this plugin:

    hnews 10
`;

const hnAPI =
  'https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty';
const hnStoryAPI = 'https://hacker-news.firebaseio.com/v0/item/';

function retrieveStoryText(storyId, fields) {
  return new Promise((resolve, reject) => {
    const request = {
      url: `${hnStoryAPI}${storyId}.json?print=pretty`,
      json: true
    };

    rp(request)
      .then((json) => {
        const storyField = Section(
          Fields(
            Markdown(`*${json.score} - ${json.title}*`),
            Markdown(`${json.url}`)
          )
        );
        // Add to the list of stories fetched
        fields.push(storyField);
        resolve();
      })
      .catch((error) => console.log(error));
  });
}

function retrieveStoryDetails(storyIDs) {
  return new Promise((resolve) => {
    const fields = [];
    const requests = [];

    // Loop over the stories and push retrieveStoryText() into
    // an array so that we can fetch the data for all the stories
    // and return only when all the jobs are done
    storyIDs.forEach((item) => {
      requests.push(retrieveStoryText(item, fields));
    });

    Promise.all(requests).then(() => resolve(fields));
  });
}

function hnews(message, groups, options) {
  if (isNaN(groups.count)) {
    options.logger.error(
      `${module.exports.name}: You need to provide a number`
    );
    return;
  }

  const request = {
    url: hnAPI,
    json: true
  };

  rp(request)
    .then((json) => retrieveStoryDetails(json.slice(0, groups.count)))
    .then((stories) => {
      // const storiesBlock = stories.join(',')
      // Post the stories
      message.reply_blocks(
        'ABC',
        Blocks(
          Section(Markdown(':ycombinator: *Hacker News* :success:')),
          Divider(),
          ...stories
        )
      );
    })
    .catch((error) => options.logger.error(`${module.exports.name}: ${error}`));
}

const events = {
  message: (options, message) => {
    match(
      message,
      {
        type: 'message',
        text: /^hnews (?<count>[0-9]{1,2})?/
      },
      (result) => hnews(message, result.groups, options)
    );
  }
};

module.exports = {
  name: 'hackernews',
  help: 'Retrieves top N stories from YC Hacker News',
  verbose,
  events
};
