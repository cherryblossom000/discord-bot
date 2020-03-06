import Discord from 'discord.js'
import send from './send'
import {ChannelType} from './data'
import type {Client} from 'discord.js'
import type {Guild} from './Guild'
import type {DMChannelData, TextChannelData} from './data'

let count = 0

export class TextChannel extends Discord.TextChannel {
  send = send

  constructor(guild: Guild) {
    super(guild, {
      id: count.toString(),
      type: ChannelType.GUILD_TEXT
    } as TextChannelData)
    count++
    this.client.channels.cache.set(this.id, this)
  }
}

export class DMChannel extends Discord.DMChannel {
  send = send

  constructor(client: Client) {
    super(client, {
      id: count.toString(),
      type: ChannelType.DM,
      recipients: [{id: '0'}],
      last_message_id: null
    } as DMChannelData)
    count++
    this.client.channels.cache.set(this.id, this)
  }
}
