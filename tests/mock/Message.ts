import Discord from 'discord.js'
import {MessageType} from './data'
import type {APIMessage, GuildMember, MessageAdditions, MessageOptions, StringResolvable} from 'discord.js'
import type {MessageData} from './data'
import type * as Pingu from '../../src/types'
import type {OptionsNoSplit, OptionsWithSplit} from '../../src/types'
import type {DMChannel, TextChannel} from './Channel'
import type {Guild} from './Guild'

let count = 0

export class GuildMessage extends Discord.Message implements Pingu.GuildMessage {
  declare client: Pingu.Client
  declare channel: TextChannel
  declare guild: Guild
  declare member: GuildMember

  constructor(channel: TextChannel) {
    super(channel.client, {
      id: count.toString(),
      type: MessageType.DEFAULT,
      channel_id: channel.id,
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
    count++
  }

  async reply(
    content?: StringResolvable,
    options?: MessageAdditions | MessageOptions | OptionsNoSplit,
  ): Promise<this>

  async reply(content?: StringResolvable, options?: MessageAdditions | OptionsWithSplit): Promise<this[]>
  async reply(options?: APIMessage | MessageAdditions | MessageOptions | OptionsNoSplit): Promise<this>
  async reply(options?: APIMessage | MessageAdditions | OptionsWithSplit): Promise<this[]>
  async reply(
    content?: StringResolvable | APIMessage | MessageAdditions | MessageOptions,
    options?: MessageAdditions | MessageOptions
  ): Promise<this | this[]> {
    return super.reply(content, options) as Promise<this | this[]>
  }
}

export class DMMessage extends Discord.Message implements Pingu.DMMessage {
  declare client: Pingu.Client
  declare channel: DMChannel
  declare guild: null
  declare member: null

  constructor(channel: DMChannel) {
    super(channel.client, {
      id: count.toString(),
      type: MessageType.DEFAULT,
      channel_id: channel.id,
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
    count++
  }

  async reply(
    content?: StringResolvable,
    options?: MessageAdditions | MessageOptions | OptionsNoSplit,
  ): Promise<this>

  async reply(content?: StringResolvable, options?: MessageAdditions | OptionsWithSplit): Promise<this[]>
  async reply(options?: APIMessage | MessageAdditions | MessageOptions | OptionsNoSplit): Promise<this>
  async reply(options?: APIMessage | MessageAdditions | OptionsWithSplit): Promise<this[]>
  async reply(
    content?: StringResolvable | APIMessage | MessageAdditions | MessageOptions,
    options?: MessageAdditions | MessageOptions
  ): Promise<this | this[]> {
    return super.reply(content, options) as Promise<this | this[]>
  }
}

export type Message = GuildMessage | DMMessage
