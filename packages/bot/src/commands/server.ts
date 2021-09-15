import {fetchTimeZone} from '../database.js'
import {startCase} from '../lodash.js'
import {
  checkPermissions,
  createDateFormatter,
  formatBoolean,
  imageField
} from '../utils.js'
import type {Channel, EmbedFieldData, VoiceChannel} from 'discord.js'
import type {GuildOnlyCommand} from '../types'

const command: GuildOnlyCommand = {
  name: 'server',
  aliases: ['sv', 'guild', 'g'],
  description: 'Gets information on this server.',
  guildOnly: true,
  async execute(message, _, database) {
    const {
      author,
      channel,
      client: {channels},
      guild
    } = message
    if (!(await checkPermissions(message, 'EMBED_LINKS'))) return

    const {
      afkChannelId,
      afkTimeout,
      applicationId,
      createdAt,
      defaultMessageNotifications,
      description,
      discoverySplash,
      features,
      id,
      memberCount,
      members,
      mfaLevel,
      name,
      ownerId,
      partnered,
      publicUpdatesChannelId,
      preferredLocale,
      premiumSubscriptionCount,
      premiumTier,
      rulesChannelId,
      systemChannelFlags,
      systemChannelId,
      vanityURLCode,
      vanityURLUses,
      verificationLevel,
      widgetChannelId,
      widgetEnabled
    } = guild
    const formatDate = createDateFormatter(
      await fetchTimeZone(database, author)
    )
    const channelFieldData = async (
      fieldName: string,
      channelID: string | null,
      getSuffix = (): string => '',
      value = (chan: Channel): string => `${chan}`
    ): Promise<readonly EmbedFieldData[]> => {
      if (channelID === null) return []
      const suffix = getSuffix()
      let field: EmbedFieldData
      try {
        field = {
          name: fieldName,
          value: value(await channels.fetch(channelID)) + suffix
        }
      } catch {
        field = {
          name: `${fieldName} ID`,
          value: channelID + suffix
        }
      }
      return [field]
    }

    const icon = guild.iconURL()
    const banner = guild.bannerURL()
    await channel.send({
      embeds: [
        {
          title: name,
          thumbnail: icon === null ? undefined : {url: icon},
          image: banner === null ? undefined : {url: banner},
          fields: [
            {name: 'ID', value: id},
            ...(description === null
              ? []
              : [{name: 'Description', value: description}]),
            {name: 'Created At', value: formatDate(createdAt)},
            {
              name: 'Owner',
              value: `${await members.fetch(ownerId)}`
            },
            ...(applicationId === null
              ? []
              : [{name: 'Application ID', value: applicationId}]),
            ...(icon === null ? [] : [imageField('Icon', icon)]),
            ...(banner === null ? [] : [imageField('Banner', banner)]),
            ...(discoverySplash === null
              ? []
              : [imageField('Discovery Splash', guild.discoverySplashURL()!)]),
            {name: 'Members', value: String(memberCount)},
            {name: 'Preferred Locale', value: preferredLocale},
            ...(features.length
              ? [
                  {
                    name: 'Features',
                    value: features
                      .map(feature =>
                        feature === 'VIP_REGIONS'
                          ? 'VIP Regions'
                          : startCase(feature)
                      )
                      .join('\n')
                  }
                ]
              : []),
            ...(vanityURLCode === null
              ? []
              : [
                  {
                    name: 'Vanity URL',
                    value: `https://discord.gg/${vanityURLCode} (${
                      vanityURLUses ?? 0
                    }) uses`
                  }
                ]),
            ...(await channelFieldData(
              'AFK Channel',
              afkChannelId,
              () => {
                let text: string
                if (afkTimeout === 3600) text = '1 hour'
                else {
                  const minutes = afkTimeout / 60
                  text = `${minutes} minute${minutes === 1 ? '' : 's'}`
                }
                return ` (timeout: ${text})`
              },
              chan => (chan as VoiceChannel).name
            )),
            ...(systemChannelFlags.has([
              'SUPPRESS_JOIN_NOTIFICATIONS',
              'SUPPRESS_PREMIUM_SUBSCRIPTIONS'
            ])
              ? []
              : await channelFieldData(
                  'System Messages Channel',
                  systemChannelId,
                  () =>
                    ` (${systemChannelFlags
                      .missing([
                        'SUPPRESS_JOIN_NOTIFICATIONS',
                        'SUPPRESS_PREMIUM_SUBSCRIPTIONS'
                      ])
                      .map(string => string.split('_')[0]!.toLowerCase())
                      .join(', ')})`
                )),
            ...(widgetEnabled ?? false
              ? await channelFieldData('Widget Channel', widgetChannelId)
              : []),
            ...(await channelFieldData(
              'Community Updates Channel',
              publicUpdatesChannelId
            )),
            ...(await channelFieldData('Rules Channel', rulesChannelId)),
            ...(premiumSubscriptionCount ?? 0
              ? [
                  {
                    name: 'Sever Boost Status',
                    value: `${
                      premiumTier === 'NONE'
                        ? 'No Server Boost'
                        : `Level ${premiumTier}`
                    } (${premiumSubscriptionCount} boosts)`
                  }
                ]
              : []),
            {
              name: 'Default Notifications',
              value:
                defaultMessageNotifications === 'ALL_MESSAGES'
                  ? 'All Messages'
                  : 'Only @mentions'
            },
            {
              name: 'Verification Level',
              value:
                verificationLevel === 'VERY_HIGH'
                  ? 'Highest'
                  : startCase(verificationLevel)
            },
            {
              name: 'Requires 2FA for moderation',
              value: formatBoolean(!!mfaLevel)
            },
            {name: 'Partnered', value: formatBoolean(partnered)}
          ]
        }
      ]
    })
  }
}
export default command
