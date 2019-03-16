import Discord from 'discord.js'
import send from './send'
import {ChannelType} from './data'
import type {Client} from 'discord.js'
import type {Guild} from './Guild'
import type {DMChannelData, TextChannelData} from './data'

export class TextChannel extends Discord.TextChannel {
  private static count = 0

  send = send

  constructor(guild: Guild) {
    super(guild, {
      id: TextChannel.count.toString(),
      type: ChannelType.GUILD_TEXT
    } as TextChannelData)
    TextChannel.count++
    this.client.channels.set(this.id, this)
  }
}

export class DMChannel extends Discord.DMChannel {
  private static count = 0

  send = send

  constructor(client: Client) {
    super(client, {
      id: DMChannel.count.toString(),
      type: ChannelType.DM,
      recipients: [{id: '0'}],
      last_message_id: null
    } as DMChannelData)
    DMChannel.count++
    this.client.channels.set(this.id, this)
  }
}
