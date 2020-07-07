import {defaultPrefix} from '../constants'
import {getPrefix, setGuildValue} from '../database'
import type {Command} from '../types'

const command: Command<true> = {
  name: 'prefix',
  aliases: ['pre'],
  description: 'Gets or sets the prefix.',
  guildOnly: true,
  syntax: '[new prefix]',
  usage: `\`new prefix\` (optional)
The text that you want to set the prefix to. If omitted, displays the current prefix.
The default prefix is \`${defaultPrefix}\`.`,
  async execute(message, {args: [newPrefix]}, database) {
    const {channel, member, guild} = message
    if (!member.hasPermission('ADMINISTRATOR')) {
      await message.reply('you must be an admin to run this command. Noot noot.')
      return
    }

    if (!newPrefix) {
      await channel.send(`The prefix is \`${await getPrefix(database, guild)}\`. Noot noot.`)
      return
    }

    await setGuildValue(database, guild, 'prefix', newPrefix)
    await channel.send(`Successfully set the prefix to \`${newPrefix}\`. Noot noot.`)
  }
}
export default command
