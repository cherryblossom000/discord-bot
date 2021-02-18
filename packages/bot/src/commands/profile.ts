import {MessageEmbed} from 'discord.js'
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
  PresenceStatus,
  User
} from 'discord.js'
import type {Command, GuildMember} from '../types'
import type {DateFormatter} from '../utils'

declare global {
  namespace Intl {
    interface DateTimeFormatOptions {
      dateStyle?: 'full' | 'long' | 'medium' | 'short'
      timeStyle?: 'full' | 'long' | 'medium' | 'short'
    }
  }
}

const formatStatus = (status: PresenceStatus): string =>
  status === 'dnd' ? 'Do Not Disturb' : upperFirst(status)

/** Creates an embed with information about a user. */
const getUserInfo = (user: User, formatDate: DateFormatter): MessageEmbed => {
  const avatar = user.displayAvatarURL()
  const {bot, createdAt, id, presence, tag} = user
  const clientStatuses = presence.clientStatus
    ? (Object.entries(presence.clientStatus) as readonly (readonly [
        keyof ClientPresenceStatusData,
        ClientPresenceStatus
      ])[])
    : null

  const embed = new MessageEmbed()
    .setTitle(tag + (bot ? ' (Bot)' : ''))
    .setThumbnail(avatar)
    .addFields(
      {name: 'ID', value: id},
      {
        name: 'Status',
        value: `**${formatStatus(presence.status)}**${
          clientStatuses?.length ?? 0
            ? `\n${clientStatuses!
                .map(([k, v]) => `${upperFirst(k)}: ${formatStatus(v)}`)
                .join('\n')}`
            : ''
        }`
      },
      {name: 'Joined Discord', value: formatDate(createdAt)},
      imageField(`Avatar${user.avatar == null ? ' (Default)' : ''}`, avatar)
    )

  const flags = user.flags?.toArray()
  if (flags?.length ?? 0) {
    embed.addField(
      'Flags',
      flags!
        .map(flag =>
          startCase(flag)
            .replace('Hypesquad', 'HypeSquad')
            .replace('Bughunter', 'Bug Hunter')
        )
        .join('\n'),
      false
    )
  }

  const {activities} = presence
  if (activities.length) {
    embed.addFields(
      activities.map(activity => ({
        name:
          startCase(activity.type) +
          (activity.type === 'LISTENING' ? ' to' : ''),
        value:
          activity.type === 'CUSTOM_STATUS'
            ? (activity.emoji
                ? `${
                    activity.emoji.id == null
                      ? activity.emoji.name
                      : `:${activity.emoji.name}:`
                  } `
                : '') + activity.state!
            : `${activity.name}${
                activity.state == null
                  ? ''
                  : `
State: ${activity.state}`
              }${
                activity.details == null
                  ? ''
                  : `
Details: ${activity.details}`
              }${
                activity.url == null
                  ? ''
                  : `
[URL](${activity.url})`
              }${
                Number.isNaN(activity.createdAt.getTime())
                  ? ''
                  : `
Start: ${formatDate(activity.createdAt)}`
              }${
                activity.timestamps?.end
                  ? `
End: ${formatDate(activity.timestamps.end)}`
                  : ''
              }${
                activity.assets?.largeText == null
                  ? ''
                  : `
Large Text: ${activity.assets.largeText}`
              }${
                activity.assets?.largeImage == null
                  ? ''
                  : `
[Large Image URL](${activity.assets.largeImageURL()!})`
              }${
                activity.assets?.smallText == null
                  ? ''
                  : `
Small Text: ${activity.assets.smallText}`
              }${
                activity.assets?.smallImage == null
                  ? ''
                  : `
[Small Image URL](${activity.assets.smallImageURL()!})`
              }`
      }))
    )
  }

  return embed
}

/** Updates an embed with information about a guild member. */
const addMemberInfo = (
  embed: MessageEmbed,
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
): void => {
  if (joinedAt) embed.addField('Joined this Server', formatDate(joinedAt))
  if (premiumSince) embed.addField('Boosting this server since', premiumSince)
  if (nickname != null) embed.addField('Nickname', nickname)
  if (roles.cache.size > 1) {
    embed.addField(
      'Roles',
      roles.cache
        .filter(r => r.name !== '@everyone')
        .map(r => r.name)
        .join('\n')
    )
    if (displayColor) embed.addField('Colour', displayHexColor)
  }
  if (channel) {
    embed.addField(
      'Voice',
      `Channel: ${channel.name}
Muted: ${formatBoolean(mute)}${serverMute === true ? ' (server)' : ''}
Deafened: ${formatBoolean(deaf)}${serverDeaf === true ? ' (server)' : ''}
Streaming: ${formatBoolean(streaming)}`
    )
  }
}

const command: Command = {
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
    const embed = getUserInfo(user, formatDate)
      .setFooter(
        `Requested by ${message.author.tag}`,
        message.author.displayAvatarURL()
      )
      .setTimestamp()

    const member = message.guild?.member(user)
    if (member) addMemberInfo(embed, member, formatDate)

    await message.channel.send(embed)
  }
}
export default command
