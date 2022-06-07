import {SlashCommandBuilder} from '@discordjs/builders'
import {fetchTimeZone} from '../../database.js'
import {
  checkPermissions,
  createDateFormatter,
  fetchGuild,
  formatBoolean,
  imageField,
  startCase,
  startCaseFromParts
} from '../../utils.js'
import type {GuildBasedChannel, EmbedFieldData, VoiceChannel} from 'discord.js'
import type {GuildOnlySlashCommand} from '../../types'

const command: GuildOnlySlashCommand = {
  data: new SlashCommandBuilder()
    .setName('server')
    .setDescription('Gets information on this server.')
    .setDMPermission(false),
  async execute(interaction, database) {
    const {client, user} = interaction
    if (!(await checkPermissions(interaction, 'EMBED_LINKS'))) return
    const guild = await fetchGuild(interaction)
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
      await fetchTimeZone(database, user.id)
    )
    const channelFieldData = async (
      fieldName: string,
      channelId: string | null,
      getSuffix = (): string => '',
      // TODO: investigate this
      // maybe the TextBasedChannel mixin is interfering?
      // eslint-disable-next-line @typescript-eslint/no-base-to-string -- false positive
      value = (channel: GuildBasedChannel): string => `${channel}`
    ): Promise<readonly EmbedFieldData[]> => {
      if (channelId === null) return []
      const suffix = getSuffix()
      const channel = (await client.channels
        .fetch(channelId)
        // eslint-disable-next-line unicorn/no-useless-undefined -- undefined not void
        .catch(() => undefined)) as GuildBasedChannel | null | undefined
      return [
        channel
          ? {
              name: fieldName,
              value: value(channel) + suffix
            }
          : {
              name: `${fieldName} Id`,
              value: channelId + suffix
            }
      ]
    }

    const icon = guild.iconURL()
    const banner = guild.bannerURL()
    await interaction.reply({
      embeds: [
        {
          title: name,
          thumbnail: icon === null ? undefined : {url: icon},
          image: banner === null ? undefined : {url: banner},
          fields: [
            {name: 'Id', value: id},
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
              : [{name: 'Application Id', value: applicationId}]),
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
                      .map(string =>
                        startCaseFromParts(
                          string.toLowerCase().split('_').slice(1)
                        )
                      )
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
