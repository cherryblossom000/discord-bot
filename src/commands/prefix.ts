import {defaultPrefix} from '../constants'
import type {Command} from '../types'
import {reply} from '../helpers'

export default {
  name: 'prefix',
  aliases: ['pr'],
  description: 'Gets or sets the prefix.',
  guildOnly: true,
  syntax: '[new prefix]',
  usage: `\`new prefix\` (optional)
The text that you want to set the prefix to. If omitted, displays the current prefix.`,
  execute: async (message, [newPrefix], prefixes) => {
    if (!message.member.hasPermission('ADMINISTRATOR')) {
      await reply(message, 'you must be an admin to run this command. Noot noot.')
      return
    }

    if (newPrefix) {
      await prefixes.set(message.guild.id, newPrefix)
      await message.channel.send(`Successfully set the prefix to \`${newPrefix}\`. Noot noot.`)
    } else
      await message.channel.send(`The prefix is \`${await prefixes.get(message.guild.id) || defaultPrefix}\`. Noot noot.`)
  }
} as Command<true>
