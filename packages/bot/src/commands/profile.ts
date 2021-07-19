import {fetchTimeZone} from '../database'
import {startCase, upperFirst} from '../lodash'
import {
  checkPermissions,
  createDateFormatter,
  formatBoolean,
  imageField,
  resolveUser
} from '../utils'
import type {
  ClientPresenceStatus,
  ClientPresenceStatusData,
  EmbedFieldData,
  PresenceStatus,
  User
} from 'discord.js'
import type {AnyCommand, GuildMember} from '../types'
import type {DateFormatter} from '../utils'

const formatStatus = (status: PresenceStatus): string =>
  status === 'dnd' ? 'Do Not Disturb' : upperFirst(status)

const userInfoFields = (
  user: User,
  avatarURL: string,
  formatDate: DateFormatter
): readonly EmbedFieldData[] => {
  const {avatar, createdAt, id, presence} = user
  const clientStatuses = presence.clientStatus
    ? (Object.entries(presence.clientStatus) as readonly (readonly [
        keyof ClientPresenceStatusData,
        ClientPresenceStatus
      ])[])
    : null

  const flags = user.flags?.toArray()
  const {activities, status} = presence

  return [
    {name: 'ID', value: id},
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
      : []),
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
            activity.type === 'CUSTOM_STATUS'
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
                (activity.url == null ? '' : `\n[URL](${activity.url})`) +
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
                  : `\n[Large Image URL](${activity.assets.largeImageURL()!})`) +
                (activity.assets?.smallText == null
                  ? ''
                  : `\nSmall Text: ${activity.assets.smallText}`) +
                (activity.assets?.smallImage == null
                  ? ''
                  : `\n[Small Image URL](${activity.assets.smallImageURL()!})`)
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
  ...(joinedAt
    ? [{name: 'Joined this Server', value: formatDate(joinedAt)}]
    : []),
  ...(premiumSince
    ? [{name: 'Boosting this server since', value: premiumSince}]
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

const command: AnyCommand = {
  name: 'profile',
  aliases: ['pr', 'pro', 'u', 'user'],
  description: 'Gets information on a user.',
  syntax: '[user]',
  usage: `\`user\` (optional)
The user to display information about. If omitted, defaults to you.
You can mention the user or use their tag (for example \`Username#1234\`).`,
  async execute(message, {input}, database) {
    if (message.guild && !(await checkPermissions(message, 'EMBED_LINKS')))
      return

    const user = await resolveUser(message, input)
    if (!user) return

    const formatDate = createDateFormatter(
      await fetchTimeZone(database, message.author)
    )
    const {bot, tag} = user
    const avatarURL = user.displayAvatarURL()
    const member = message.guild?.member(user)
    await message.channel.send({
      embed: {
        title: tag + (bot ? ' (Bot)' : ''),
        thumbnail: {url: avatarURL},
        fields: [
          ...userInfoFields(user, avatarURL, formatDate),
          ...(member ? memberInfoFields(member, formatDate) : [])
        ],
        footer: {
          text: `Requested by ${message.author.tag}`,
          iconURL: message.author.displayAvatarURL()
        },
        timestamp: Date.now()
      }
    })
  }
}
export default command
