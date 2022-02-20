import {hyperlink} from '@discordjs/builders'
import {fetchTimeZone} from '../../database.js'
import {
  checkPermissions,
  createDateFormatter,
  fetchGuild,
  formatBoolean,
  imageField,
  startCase,
  upperFirst
} from '../../utils.js'
import type {
  ClientPresenceStatus,
  ClientPresenceStatusData,
  EmbedFieldData,
  GuildMember,
  Presence,
  PresenceStatus,
  User
} from 'discord.js'
import type {ContextMenuCommand} from '../../types'
import type {DateFormatter} from '../../utils'

const formatStatus = (status: PresenceStatus): string =>
  status === 'dnd' ? 'Do Not Disturb' : upperFirst(status)

const userInfoFields = (
  user: User,
  avatarURL: string,
  formatDate: DateFormatter
): readonly EmbedFieldData[] => {
  const {avatar, createdAt, id} = user

  const flags = user.flags?.toArray()

  return [
    {name: 'ID', value: id},
    {name: 'Joined Discord', value: formatDate(createdAt)},
    imageField(`Avatar${avatar == null ? ' (Default)' : ''}`, avatarURL),
    ...(flags?.length ?? 0
      ? [
          {
            name: 'Flags',
            value: flags!
              .map(flag =>
                startCase(flag)
                  .replace('Hypesquad', 'HypeSquad')
                  .replace('Bughunter', 'Bug Hunter')
              )
              .join('\n')
          }
        ]
      : [])
  ]
}

const presenceFields = (
  {activities, clientStatus, status}: Presence,
  formatDate: DateFormatter
): readonly EmbedFieldData[] => {
  const clientStatuses = clientStatus
    ? (Object.entries(clientStatus) as readonly (readonly [
        keyof ClientPresenceStatusData,
        ClientPresenceStatus
      ])[])
    : undefined

  return [
    {
      name: 'Status',
      value: `**${formatStatus(status)}**${
        clientStatuses?.length ?? 0
          ? `\n${clientStatuses!
              .map(([k, v]) => `${upperFirst(k)}: ${formatStatus(v)}`)
              .join('\n')}`
          : ''
      }`
    },
    ...(activities.length
      ? activities.map(activity => ({
          name:
            startCase(activity.type) +
            (activity.type === 'LISTENING'
              ? ' to'
              : activity.type === 'COMPETING'
              ? ' in'
              : ''),
          value:
            activity.type === 'CUSTOM'
              ? (activity.emoji
                  ? `${
                      activity.emoji.id == null
                        ? activity.emoji.name
                        : `:${activity.emoji.name}:`
                    } `
                  : '') + activity.state!
              : activity.name +
                (activity.state == null ? '' : `\nState: ${activity.state}`) +
                (activity.details == null
                  ? ''
                  : `\nDetails: ${activity.details}`) +
                (activity.url == null
                  ? ''
                  : `\n${hyperlink('URL', activity.url)}`) +
                (Number.isNaN(activity.createdAt.getTime())
                  ? ''
                  : `\nStart: ${formatDate(activity.createdAt)}`) +
                (activity.timestamps?.end
                  ? `\nEnd: ${formatDate(activity.timestamps.end)}`
                  : '') +
                (activity.assets?.largeText == null
                  ? ''
                  : `\nLarge Text: ${activity.assets.largeText}`) +
                (activity.assets?.largeImage == null
                  ? ''
                  : `\n${hyperlink(
                      'Large Image URL',
                      activity.assets.largeImageURL()!
                    )}`) +
                (activity.assets?.smallText == null
                  ? ''
                  : `\nSmall Text: ${activity.assets.smallText}`) +
                (activity.assets?.smallImage == null
                  ? ''
                  : `\n${hyperlink(
                      'Small Image URL',
                      activity.assets.smallImageURL()!
                    )}`)
        }))
      : [])
  ]
}

const memberInfoFields = (
  {
    displayColor,
    displayHexColor,
    joinedAt,
    nickname,
    premiumSince,
    presence,
    roles,
    voice: {
      channel,
      deaf,
      mute,
      serverDeaf = false,
      serverMute = false,
      streaming
    }
  }: GuildMember,
  formatDate: DateFormatter
): readonly EmbedFieldData[] => [
  ...(presence ? presenceFields(presence, formatDate) : []),
  ...(joinedAt
    ? [{name: 'Joined this Server', value: formatDate(joinedAt)}]
    : []),
  ...(premiumSince
    ? [{name: 'Boosting this server since', value: formatDate(premiumSince)}]
    : []),
  ...(nickname === null ? [] : [{name: 'Nickname', value: nickname}]),
  ...(roles.cache.size > 1
    ? [
        {
          name: 'Roles',
          value: roles.cache
            .filter(r => r.name !== '@everyone')
            .map(r => r.name)
            .join('\n')
        }
      ]
    : []),
  ...(displayColor ? [{name: 'Colour', value: displayHexColor}] : []),
  ...(channel
    ? [
        {
          name: 'Voice',
          value: `Channel: ${channel.name}
Muted: ${formatBoolean(mute)}${serverMute === true ? ' (server)' : ''}
Deafened: ${formatBoolean(deaf)}${serverDeaf === true ? ' (server)' : ''}
Streaming: ${formatBoolean(streaming)}`
        }
      ]
    : [])
]

const command: ContextMenuCommand = {
  name: 'Profile',
  async execute(interaction, database) {
    if (!(await checkPermissions(interaction, 'EMBED_LINKS'))) return

    const user = interaction.options.getUser('user', true)
    const formatDate = createDateFormatter(
      await fetchTimeZone(database, interaction.user.id)
    )
    const {bot, id, tag} = user
    const avatarURL = user.displayAvatarURL({size: 4096})
    await interaction.reply({
      embeds: [
        {
          title: tag + (bot ? ' (Bot)' : ''),
          thumbnail: {url: avatarURL},
          fields: [
            ...userInfoFields(user, avatarURL, formatDate),
            ...(interaction.inGuild()
              ? memberInfoFields(
                  await (await fetchGuild(interaction)).members.fetch(id),
                  formatDate
                )
              : [])
          ],
          footer: {
            text: `Requested by ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL()
          },
          timestamp: Date.now()
        }
      ]
    })
  }
}
export default command
