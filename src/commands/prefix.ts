import {defaultPrefix} from '../constants'
import type {Command} from '../types'

export default {
  name: 'prefix',
  aliases: ['pr'],
  description: 'Gets or sets the prefix.',
  guildOnly: true,
  syntax: '[new prefix]',
  usage: `\`new prefix\` (optional)
The text that you want to set the prefix to. If omitted, displays the current prefix.`,
  execute: async (message, [newPrefix], prefixes) => {
    if (newPrefix) {
      await prefixes.set(message.guild.id, newPrefix)
      await message.channel.send(`Successfully set the prefix to \`${newPrefix}\`. Noot noot.`)
    } else
      await message.channel.send(`The prefix is \`${await prefixes.get(message.guild.id) || defaultPrefix}\`. Noot noot.`)
  }
} as Command<true>
