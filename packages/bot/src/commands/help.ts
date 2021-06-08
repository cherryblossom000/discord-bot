import {Constants, DiscordAPIError} from 'discord.js'
import {defaultPrefix} from '../constants'
import {fetchPrefix} from '../database'
import {handleError} from '../utils'
import type {AnyCommand} from '../types'

const command: AnyCommand = {
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
      channel,
      client,
      client: {commands},
      guild
    } = message

    // All commands
    if (!args.length) {
      try {
        await author.send(
          [
            'Here’s a list of all my commands:',
            ...commands
              .filter(({hidden = false}) => !hidden)
              .map(({name, description}) => `\`${name}\`: ${description}`),
            `
You can send \`${defaultPrefix}help [command name]\` to get info on a specific command. Noot noot.`
          ],
          {split: true}
        )
        if (channel.type !== 'dm') {
          await message.reply(
            'I’ve sent you a DM with all my commands. Noot noot.'
          )
        }
        return
      } catch (error: unknown) {
        if (
          error instanceof DiscordAPIError &&
          error.code === Constants.APIErrors.CANNOT_MESSAGE_USER
        ) {
          await Promise.all<void>([
            // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression -- Promise.all
            handleError(
              client,
              error,
              `Could not send help DM to ${author.tag}:`
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
    const commandName = args[0]!.toLowerCase()
    const _command =
      commands.get(commandName) ??
      commands.find(({aliases = []}) => aliases.includes(commandName))

    // Invalid command
    if (!_command) {
      await message.reply('that’s not a valid command. Noot noot.')
      return
    }

    const {name, aliases, description, syntax, usage, cooldown} = _command
    await channel.send(
      [
        `**Name:** ${name}`,
        ...(aliases ? [`**Aliases:** ${aliases.join(', ')}`] : []),
        ...(description ? [`**Description:** ${description}`] : []),
        `**Usage:** \`${await fetchPrefix(database, guild)}${name} ${
          syntax ?? ''
        }\`${usage === undefined ? '' : `\n${usage}`}`,
        `**Cooldown:** ${cooldown ?? 3} second${cooldown === 1 ? '' : 's'}`
      ],
      {split: true}
    )
  }
}
export default command
