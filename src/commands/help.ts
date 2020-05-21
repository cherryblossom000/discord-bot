import {defaultPrefix} from '../constants'
import {reply, sendMeError, getPrefix} from '../helpers'
import type {Command} from '../types'

const _: Command = {
  name: 'help',
  aliases: ['commands', 'h'],
  description: 'Lists all my commands or gets info about a specific command.',
  syntax: '[command]',
  usage: `\`command\` (optional)
The command that you want to get info about. If omitted, all the commands will be listed.`,
  cooldown: 5,
  async execute(message, {args}, database) {
    // constants
    const {author, client, client: {commands}, guild} = message,
      data = []

    // All commands
    if (!args.length) {
      data.push(
        'Here\u2019s a list of all my commands:',
        ...commands.filter(command => !command.hidden).map(command => `\`${command.name}\`: ${command.description}`),
        `
You can send \`${defaultPrefix}help [command name]\` to get info on a specific command. Noot noot.`
      )

      try {
        await author.send(data, {split: true})
        if (message.channel.type !== 'dm') await message.reply('I\u2019ve sent you a DM with all my commands. Noot noot.')
        return
      } catch (error) {
        sendMeError(client, error, `Could not send help DM to ${author.tag}.`)
        return reply(message, `it seems like I can\u2019t DM you. Noot noot.
Do you have DMs disabled?`)
      }
    }

    // Specific command
    const commandName = args[0].toLowerCase(),
      command = commands.get(commandName) ?? commands.find(c => !!c.aliases?.includes(commandName))

    // Invalid command
    if (!command) return reply(message, 'that\u2019s not a valid command. Noot noot.')

    // Gets info of command
    const {name, aliases, description, syntax, usage, cooldown} = command
    data.push(`**Name:** ${name}`)
    if (aliases) data.push(`**Aliases:** ${aliases.join(', ')}`)
    if (description) data.push(`**Description:** ${description}`)
    data.push(`**Usage:** \`${await getPrefix(database, guild)}${name} ${syntax ?? ''}\`${usage ? `\n${usage}` : ''}`)
    data.push(`**Cooldown:** ${cooldown ?? 3} second${cooldown === 1 ? '' : 's'}`)

    await message.channel.send(data, {split: true})
  }
}
export default _
