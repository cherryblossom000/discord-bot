import {prefix} from '../constants'
import {reply} from '../helpers'
import type {PinguClient, PinguCommand} from '../types'

export default {
  name: 'help',
  aliases: ['commands', 'h'],
  description: 'Lists all my commands or gets info about a specific command,',
  syntax: '[command]',
  usage: `\`command\` (optional)
The command that you want to get info about. If no value is set, all the commands will be listed.`,
  cooldown: 5,
  execute: (message, args) => {
    // constants
    const {author} = message
    const data = []
    const {commands} = message.client as PinguClient

    // all commands
    if (!args.length) {
      data.push('Here\u{2019}s a list of all my commands:')
      data.push(...commands.map(command => `\`${command.name}\`: ${command.description}`))
      data.push(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command. Noot noot.`)

      return author.send(data, {split: true})
        .then(() => {
          if (message.channel.type === 'dm') return
          message.reply('I\u{2019}ve sent you a DM with all my commands. Noot noot.')
        })
        .catch(error => {
          console.error(`Could not send help DM to ${author.tag}.`, error)
          reply(message, `it seems like I can\u{2019}t DM you. Noot noot.
Do you have DMs disabled?`)
        })
    }

    // specific command
    const commandName = args[0].toLowerCase()
    const command = commands.get(commandName) ||
      commands.find(command => !!command.aliases?.includes(commandName))

    // invalid command
    if (!command) return reply(message, 'that\u{2019}s not a valid command. Noot noot.')

    // gets info of command
    data.push(`**Name:** ${command.name}`)
    if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`)
    if (command.description) data.push(`**Description:** ${command.description}`)
    data.push('**Usage:** ' +
      `\`${prefix}${command.name}${command.syntax}\`${command.usage ? `\n${command.usage}` : ''}`)
    data.push(`**Cooldown:** ${command.cooldown ?? 3} second${command.cooldown === 1 ? '' : 's'}`)

    message.channel.send(data, {split: true})
  }
} as PinguCommand
