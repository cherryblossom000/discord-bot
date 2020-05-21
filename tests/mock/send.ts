import {Message} from './Message'
import type {MessageOptions, TextBasedChannelFields} from 'discord.js'
import type ActionsManager from './ActionsManager'
import type {DMChannel, TextChannel} from './Channel'

export default (
  this_: TextChannel | DMChannel
): TextBasedChannelFields['send'] => (async ({content}: MessageOptions): Promise<Message | Message[]> =>
  // eslint-disable-next-line dot-notation
  (this_.client['actions'] as ActionsManager).MessageCreate.handle({
    id: '1',
    type: 0,
    channel_id: this_.id,
    content: content ?? '',
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
  }).message
) as TextBasedChannelFields['send']
