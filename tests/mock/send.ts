/* eslint-disable dot-notation */
import {Message} from './Message'
import type {DMChannel, TextChannel} from './Channel'
import type {MessageOptions, TextBasedChannelFields} from 'discord.js'

// eslint-disable-next-line @typescript-eslint/require-await
async function send(this: TextChannel | DMChannel, {content}: MessageOptions): Promise<Message> {
  return (this.client['actions'] as any).MessageCreate.handle({
    id: '1',
    type: 0,
    channel_id: this.id,
    content,
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
  })
}

export default send as TextBasedChannelFields['send']
