import fetch from 'node-fetch'
import sharp from 'sharp'
import {checkPermissions, resolveMessage} from '../utils'
import type {AnyCommand} from '../types'

const command: AnyCommand = {
  name: 'rotate',
  description: 'Rotates an image.',
  aliases: ['rt'],
  args: 1,
  syntax: '<message> [channel] <rotation>',
  usage: `\`message\`
The ID or message link of the message to rotate.

\`channel\` (optional)
The channel of the message. This is required if the message is not in this channel.

\`rotation\`
The amount (in degrees) to rotate the image clockwise. Negative values work as well.`,
  async execute(message, {args}) {
    if (message.guild && !(await checkPermissions(message, 'ATTACH_FILES')))
      return
    const msg = await resolveMessage(
      message,
      args.length > 1 ? args[0] : undefined,
      args.length === 3 ? args[1]! : undefined
    )
    if (!msg) return

    const attachment = msg.attachments.first()
    if (!attachment) {
      await message.reply(
        'that message doesn’t have any attachments! Noot noot.'
      )
      return
    }

    const rawRotation = args[args.length - 1]!
    const rotation = Number(rawRotation)
    if (Number.isNaN(rotation)) {
      await message.reply(`${rawRotation} isn’t a number!`)
      return
    }

    const typingPromise = message.channel.startTyping()

    let buffer: Buffer
    try {
      buffer = await sharp(await (await fetch(attachment.url)).buffer())
        .rotate(rotation)
        .toBuffer()
    } catch {
      await message.reply('there was an error rotating the image!')
      return
    }

    message.channel.stopTyping()
    await typingPromise

    await message.channel.send({
      content:
        msg.attachments.size > 1
          ? `**Warning:** The message contained ${msg.attachments.size} attachments. I chose the first one.`
          : undefined,
      files: [{attachment: buffer, name: attachment.name ?? undefined}]
    })
  }
}
export default command
