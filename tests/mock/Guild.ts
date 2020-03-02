import Discord from 'discord.js'
import {DefaultMessageNotificationLevel, ExplicitContentFilterLevel, MFALevel, VerificationLevel} from './data'
import type {Client} from 'discord.js'
import type {GuildData} from './data'

export class Guild extends Discord.Guild {
  private static count = 0

  constructor(client: Client) {
    super(client, {
      id: Guild.count.toString(),
      name: 'guild name',
      icon: null,
      splash: null,
      owner_id: '',
      region: '',
      afk_channel_id: null,
      afk_timeout: 0,
      verification_level: VerificationLevel.NONE,
      default_message_notifications: DefaultMessageNotificationLevel.ALL_MESSAGES,
      explicit_content_filter: ExplicitContentFilterLevel.DISABLED,
      roles: [],
      emojis: [],
      features: [],
      mfa_level: MFALevel.NONE,
      application_id: null,
      system_channel_id: null
    } as GuildData)
    Guild.count++
    this.client.guilds.cache.set(this.id, this)
  }
}
