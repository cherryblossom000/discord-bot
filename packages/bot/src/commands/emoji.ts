import type {Command} from '../types'

const command: Command<true> = {
  name: 'emoji',
  aliases: ['em'],
  description: 'Gets the image for an emoji.',
  guildOnly: true,
  syntax: '<emoji>',
  usage: `\`emoji\`
The emoji to get the image of.`,
  async execute(message) {
    const id = /<:[\w]+:(\d+)>/u.exec(message.content)?.[1]
    if (id === undefined) {
      await message.reply('please provide an emoji!')
      return
    }

    const emoji = (await message.guild.fetch()).emojis.cache.get(id)
    if (!emoji) {
      await message.reply(`${id} is not a valid emoji id!`)
      return
    }

    await message.channel.send({files: [emoji.url]})
  }
}
export default command
