# Contributing

When contributing to this repository, please first discuss the change you wish to make via issue,
email, or any other method with the owners of this repository before making a change. 

Please note we have a code of conduct, please follow it in all your interactions with the project.

## Pull Request Process

1. Ensure any install or build dependencies are removed before the end of the layer when doing a build.
2. Update the README.md with details of changes to the interface, this includes new environment variables, exposed ports, useful file locations and container parameters.
3. Make sure you add a documentation file for your plugin in `./docs`. Make sure the name of the file is exactly the same as your plugin's javascript main file.
4. You may merge the Pull Request in once you have the sign-off of at least 2 maintainers, or if you do not have permission to do that, you may request the second reviewer to merge it for you.

## Plugin Template

In general there are no limit on how you can tweak or design your plugin. However for the specifics of this project, we prefer to stick to the following template:

1. Create a new file in `./plugins` and make sure the name of the plugin is short and indicative.

2. Use the following boilerplate code:

```javascript
const match = require('@menadevs/objectron')

const verbose = `
How to use this plugin:

    command param1 param2
    command_variation param 1
`

/**
 * Function documentation
 *
 * @param {*} message Message object
 * @param {*} groups RegEx named groups returned by match()
 */
const pluginMainMethod = (message, groups) => {
  
  // Do something here...

  message.reply(<plugin's response to the user>)
}

const events = {
  message: (options, message) => {
    match(message, {
      type: 'message',
      text: /^<plugin name> <?<query>(.*)>$/
    }, result => {
      return pluginMainMethod(message, result.groups)
    })
}

module.exports = {
  name: '<plugin name>',
  help: '<describe in 1 sentence what this plugin does>',
  verbose,
  events
}
```

3. Don't forget to add a reference to your plugin in the `config.js` so it gets loaded.