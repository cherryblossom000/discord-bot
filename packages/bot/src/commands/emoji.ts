import type {GuildOnlyCommand} from '../types'

const command: GuildOnlyCommand = {
  name: 'emoji',
  aliases: ['em'],
  description: 'Gets the image for an emoji.',
  guildOnly: true,
  syntax: '<emoji>',
  usage: `\`emoji\`
The emoji to get the image of.`,
  async execute(message) {
    // TODO: check for permissons
    const {channel, content, guild} = message
    const id = /<(?::a)?:[\w]+:(\d+)>/u.exec(content)?.[1]
    if (id === undefined) {
      await message.reply('please provide an emoji!')
      return
    }

    // Maybe the bot went offline or something when an emoji was created
    const emoji =
      guild.emojis.cache.get(id) ?? (await guild.fetch()).emojis.cache.get(id)
    if (!emoji) {
      await message.reply(`${id} is not a valid emoji id!`)
      return
    }

    await channel.send({files: [emoji.url]})
  }
}
export default command
