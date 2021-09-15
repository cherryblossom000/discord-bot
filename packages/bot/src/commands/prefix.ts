import {defaultPrefix} from '../constants.js'
import {fetchPrefix, setValue} from '../database.js'
import type {GuildOnlyCommand} from '../types'

const command: GuildOnlyCommand = {
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
    if (!member.permissions.has('ADMINISTRATOR')) {
      await message.reply(
        'you must be an admin to run this command. Noot noot.'
      )
      return
    }

    if (!(newPrefix ?? '')) {
      await channel.send(
        `The prefix is \`${await fetchPrefix(database, guild)}\`. Noot noot.`
      )
      return
    }

    await setValue(database, 'guilds', guild, 'prefix', newPrefix)
    await channel.send(
      `Successfully set the prefix to \`${newPrefix}\`. Noot noot.`
    )
  }
}
export default command
