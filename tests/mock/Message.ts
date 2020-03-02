import Discord from 'discord.js'
import {MessageType} from './data'
import type {DMChannel, TextChannel} from './Channel'
import type {MessageData} from './data'

export class Message extends Discord.Message {
  private static count = 0

  constructor(channel: TextChannel | DMChannel) {
    super(channel.client, {
      id: Message.count.toString(),
      type: MessageType.DEFAULT,
      content: '',
      author: {
        id: '554539674899841055',
        username: 'Comrade Pingu',
        discriminator: '0323',
        avatar: 'f474ec30912d9b370f8ef17a7c19b082',
        bot: true
      },
      pinned: false,
      tts: false,
      nonce: '',
      embeds: [],
      attachments: [],
      timestamp: Date.now(),
      edited_timestamp: null,
      mentions: [],
      mention_roles: [],
      mention_everyone: false
    } as MessageData, channel)
    Message.count++
  }
}
