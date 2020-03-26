import type {Command} from '../types'
import {getPrefix, reply, set} from '../helpers'

export default {
  name: 'prefix',
  aliases: ['pr'],
  description: 'Gets or sets the prefix.',
  guildOnly: true,
  syntax: '[new prefix]',
  usage: `\`new prefix\` (optional)
The text that you want to set the prefix to. If omitted, displays the current prefix.
The default prefix is \`.\`.`,
  execute: async (message, [newPrefix], database) => {
    const {channel, member, guild} = message
    if (!member.hasPermission('ADMINISTRATOR')) {
      await reply(message, 'you must be an admin to run this command. Noot noot.')
      return
    }

    if (newPrefix) {
      await set(database, guild, 'prefix', newPrefix)
      await channel.send(`Successfully set the prefix to \`${newPrefix}\`. Noot noot.`)
    } else await channel.send(`The prefix is \`${await getPrefix(database, guild)}\`. Noot noot.`)
  }
} as Command<true>
