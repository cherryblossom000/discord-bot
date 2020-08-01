import {Constants} from 'discord.js'
import {defaultPrefix} from '../constants'
import {getPrefix} from '../database'
import {sendMeError} from '../utils'
import type {Command} from '../types'

const command: Command = {
  name: 'help',
  aliases: ['commands', 'h'],
  description: 'Lists all my commands or gets info about a specific command.',
  syntax: '[command]',
  usage: `\`command\` (optional)
The command that you want to get info about. If omitted, all the commands will be listed.`,
  cooldown: 5,
  async execute(message, {args}, database) {
    // constants
    const {
      author,
      client,
      client: {commands},
      guild
    } = message
    const data = []

    // All commands
    if (!args.length) {
      data.push(
        'Here’s a list of all my commands:',
        ...commands
          .filter(({hidden = false}) => !hidden)
          .map(({name, description}) => `\`${name}\`: ${description}`),
        `
You can send \`${defaultPrefix}help [command name]\` to get info on a specific command. Noot noot.`
      )

      try {
        await author.send(data, {split: true})
        if (message.channel.type !== 'dm') {
          await message.reply(
            'I’ve sent you a DM with all my commands. Noot noot.'
          )
        }
        return
      } catch (error) {
        if (
          (error as {code?: number}).code ===
          Constants.APIErrors.CANNOT_MESSAGE_USER
        ) {
          await Promise.all<void>([
            sendMeError(
              client,
              error,
              `Could not send help DM to ${author.tag}.`
            ),
            message.sendDeletableMessage({
              reply: true,
              content: `it seems like I can’t DM you. Noot noot.
Do you have DMs disabled?`
            })
          ])
          return
        }
        throw error
      }
    }

    // Specific command
    const commandName = args[0].toLowerCase()
    const _command =
      commands.get(commandName) ??
      commands.find(({aliases = []}) => aliases.includes(commandName))

    // Invalid command
    if (!_command) {
      await message.reply('that’s not a valid command. Noot noot.')
      return
    }

    // Gets info of command
    const {name, aliases, description, syntax, usage, cooldown} = _command
    data.push(`**Name:** ${name}`)
    if (aliases) data.push(`**Aliases:** ${aliases.join(', ')}`)
    if (description) data.push(`**Description:** ${description}`)
    data.push(
      `**Usage:** \`${await getPrefix(database, guild)}${name} ${
        syntax ?? ''
      }\`${usage === undefined ? '' : `\n${usage}`}`
    )
    data.push(
      `**Cooldown:** ${cooldown ?? 3} second${cooldown === 1 ? '' : 's'}`
    )

    await message.channel.send(data, {split: true})
  }
}
export default command
