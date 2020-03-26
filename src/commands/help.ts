import {defaultPrefix} from '../constants'
import {reply, sendMeError, getPrefix} from '../helpers'
import type {Command} from '../types'

export default {
  name: 'help',
  aliases: ['commands', 'h'],
  description: 'Lists all my commands or gets info about a specific command.',
  syntax: '[command]',
  usage: `\`command\` (optional)
The command that you want to get info about. If omitted, all the commands will be listed.`,
  cooldown: 5,
  execute: async (message, args, database) => {
    // constants
    const {author, client, client: {commands}, guild} = message, data = []

    // all commands
    if (!args.length) {
      data.push(
        'Here\u2019s a list of all my commands:',
        ...commands.map(command => `\`${command.name}\`: ${command.description}`),
        `
You can send \`${defaultPrefix}help [command name]\` to get info on a specific command. Noot noot.`
      )

      try {
        await author.send(data, {split: true})
        if (message.channel.type === 'dm') return
        await message.reply('I\u2019ve sent you a DM with all my commands. Noot noot.')
        return
      } catch (error) {
        sendMeError(client, error, `Could not send help DM to ${author.tag}.`)
        await reply(message, `it seems like I can\u2019t DM you. Noot noot.
Do you have DMs disabled?`)
      }
    }

    // specific command
    const commandName = args[0].toLowerCase(),
      command = commands.get(commandName) || commands.find(command => !!command.aliases?.includes(commandName))

    // invalid command
    if (!command) {
      reply(message, 'that\u2019s not a valid command. Noot noot.')
      return
    }

    // gets info of command
    const {name, aliases, description, syntax, usage, cooldown} = command
    data.push(`**Name:** ${name}`)
    if (aliases) data.push(`**Aliases:** ${aliases.join(', ')}`)
    if (description) data.push(`**Description:** ${description}`)
    data.push(`**Usage:** \`${await getPrefix(database, guild)}${name} ${syntax ?? ''}\`${usage ? `\n${usage}` : ''}`)
    data.push(`**Cooldown:** ${cooldown ?? 3} second${cooldown === 1 ? '' : 's'}`)

    message.channel.send(data, {split: true})
  }
} as Command
