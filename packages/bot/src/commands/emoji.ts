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
    const {channel, content} = message
    const match = (
      /<(a?):[\w]+:(\d+)>/u as {
        exec(
          string: string
        ): (RegExpExecArray & [string, string, string]) | null
      }
    ).exec(content)
    if (!match) {
      await message.reply('please provide an emoji!')
      return
    }
    const [, animated, id] = match

    await channel.send({
      files: [
        `https://cdn.discordapp.com/emojis/${id}.${animated ? 'gif' : 'png'}`
      ]
    })
  }
}
export default command
