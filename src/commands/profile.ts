import {MessageEmbed} from 'discord.js'
import startCase from 'lodash.startcase'
import upperFirst from 'lodash.upperfirst'
import {reply} from '../helpers'
import type {GuildMember, PresenceStatus, User} from 'discord.js'
import type {Command} from '../types'

declare global {
  interface ObjectConstructor {
    entries<K extends keyof any, V>(o: Partial<Record<K, V>>): [K, V][]
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Intl {
    interface DateTimeFormatOptions {
      dateStyle?: 'full' | 'long' | 'medium' | 'short'
      timeStyle?: 'full' | 'long' | 'medium' | 'short'
    }
  }
}

const formatBoolean = (boolean?: boolean): string => boolean ? 'Yes' : 'No'
const formatStatus = (status: PresenceStatus): string => status === 'dnd' ? 'Do Not Disturb' : upperFirst(status)
const formatDate = (date: Date): string => date.toLocaleString('en-AU', {dateStyle: 'short', timeStyle: 'short'})

/** Creates an embed with information about a user. */
const getUserInfo = (user: User): MessageEmbed => {
  const avatar = user.displayAvatarURL(),
    {bot, createdAt, id, presence, tag} = user,
    clientStatuses = presence.clientStatus ? Object.entries(presence.clientStatus) : null

  const embed = new MessageEmbed()
    .setTitle(tag + (bot ? ' (Bot)' : ''))
    .setThumbnail(avatar)
    .addFields(
      {name: 'ID', value: id},
      {
        name: 'Status',
        value: `**${formatStatus(presence.status)}**${
            clientStatuses?.length
              ? `\n${clientStatuses.map(([k, v]) => `${upperFirst(k)}: ${formatStatus(v)}`).join('\n')}`
              : ''}`
      },
      {name: 'Joined Discord', value: formatDate(createdAt)},
      {name: `Avatar${user.avatar ? '' : ' (Default)'}`, value: `[Link](${avatar})`}
      // TODO: Fix Discord.js: it has user#locale as string not as an optional string
    )

  const flags = user.flags.toArray()
  if (flags.length) {
    embed.addField(
      'Flags',
      flags
        .map(f => startCase(f.toLowerCase()).replace('Hypesquad', 'HypeSquad').replace('Bughunter', 'Bug Hunter'))
        .join('\n'),
      false
    )
  }

  const {activities} = presence
  if (activities.length) {
    embed.addFields(
      activities.map(a => ({
        name: startCase(a.type.toLowerCase()) + (a.type === 'LISTENING' ? ' to' : ''),
        value: a.type === 'CUSTOM_STATUS'
          ? (a.emoji ? `${a.emoji.id ? `:${a.emoji.name}:` : a.emoji.name} ` : '') + a.state
          : `${a.name}${a.state ? `
State: ${a.state}` : ''}${a.details ? `
Details: ${a.details}` : ''}${a.url ? `
[URL](${a.url})` : ''}${Number.isNaN(a.createdAt.getTime()) ? '' : `
Start: ${formatDate(a.createdAt)}`}${a.timestamps?.end ? `
End: ${formatDate(a.timestamps.end)}` : ''}${a.assets?.largeText ? `
Large Text: ${a.assets.largeText}` : ''}${a.assets?.largeImage ? `
[Large Image URL](${a.assets.largeImageURL()})` : ''}${a.assets?.smallText ? `
Small Text: ${a.assets.smallText}` : ''}${a.assets?.smallImage ? `
[Small Image URL](${a.assets.smallImageURL()})` : ''}`
      }))
    )
  }

  return embed
}

/** Updates an embed with information about a guild member. */
const addMemberInfo = (
  embed: MessageEmbed, {displayColor, displayHexColor, joinedAt, nickname, premiumSince, roles, voice}: GuildMember
): void => {
  if (joinedAt) embed.addField('Joined this Server', formatDate(joinedAt))
  if (premiumSince) embed.addField('Boosting this server since', premiumSince)
  if (nickname) embed.addField('Nickname', nickname)
  if (roles.cache.size > 1) {
    embed.addField('Roles', roles.cache.filter(r => r.name !== '@everyone').map(r => r.name).join('\n'))
    if (displayColor) embed.addField('Colour', displayHexColor)
  }
  if (voice.channel) {
    embed.addField('Voice', `Channel: ${voice.channel.name}
Muted: ${formatBoolean(voice.mute)}${voice.serverMute ? ' (server)' : ''}
Deafened: ${formatBoolean(voice.deaf)}${voice.serverDeaf ? ' (server)' : ''}
Streaming: ${formatBoolean(voice.streaming)}`)
  }
}

const _: Command = {
  name: 'profile',
  aliases: ['pr', 'pro', 'user'],
  description: 'Gets information on a user.',
  syntax: '[user]',
  usage: `\`user\` (optional)
The user to display information about. If omitted, defaults to you.
You can mention the user or use their tag (for example \`Username#1234\`).`,
  execute(message, {input}) {
    const {author, client, channel, guild, mentions} = message

    let user = mentions.users.first()
    if (!user && input) {
      if (!/^.{2,}#\d{4}$/u.test(input)) return reply(message, `\u2018${input}\u2019 is not a valid user!`)
      if (!guild && input !== author.tag && input !== client.user!.tag)
        return reply(message, 'you can only get information about you or I in a DM!')
      user = client.users.cache.find(u => u.tag === input)
      if (!user || !guild!.member(user))
        return reply(message, `\u2018${input}\u2019 is not a valid user or is not a member of this guild!`)
    } else user = user ?? author

    const embed = getUserInfo(user)
      .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL())
      .setTimestamp()

    const member = guild?.member(user)
    if (member) addMemberInfo(embed, member)

    channel.send(embed)
  }
}
export default _
