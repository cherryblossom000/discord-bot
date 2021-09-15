import {me} from '../constants.js'
import {
  MemberRejoinFlags,
  addMemberRejoinInfo,
  collection,
  fetchMemberRejoinInfo,
  fetchValue,
  removeMember,
  setValue,
  disableRejoin
} from '../database.js'
import {checkPermissions, handleError} from '../utils.js'
// eslint-disable-next-line import/no-named-default -- can't because type import
import type {default as Client, Listener} from '../Client'
import type {Db} from '../database'
import type {GuildOnlyCommand, Guild, GuildMessage} from '../types'

const undefinedIfRejected = async <T>(
  promise: Promise<T>
): Promise<T | undefined> =>
  // eslint-disable-next-line unicorn/no-useless-undefined -- undefined not void
  promise.catch(() => undefined)

export const addListeners = (
  client: Client,
  guild: Guild,
  database: Db,
  flags: MemberRejoinFlags
): void => {
  const enabledRoles = flags & MemberRejoinFlags.Roles
  const enabledNickname = flags & MemberRejoinFlags.Nickname
  const enabledAll = enabledRoles && enabledNickname

  const guildMemberAdd: Listener<'guildMemberAdd'> = async member => {
    if (member.guild.id === guild.id) {
      const guilds = collection(database, 'guilds')
      try {
        // Set roles and nicknames
        const {roles, nickname} = await fetchMemberRejoinInfo(guilds, member)
        await Promise.all([
          ...(enabledRoles && roles
            ? [
                member.roles.add(
                  roles.filter(r => member.guild.roles.cache.has(r))
                )
              ]
            : []),
          ...(enabledNickname && nickname !== undefined
            ? [member.setNickname(nickname)]
            : [])
        ])
      } catch (error: unknown) {
        const owner = await undefinedIfRejected(guild.fetchOwner())
        handleError(
          client,
          error,
          `Rejoin guildMemberAdd failed (member ${member.id}, flags ${flags})`,
          (!guild.systemChannelFlags.has('SUPPRESS_JOIN_NOTIFICATIONS') &&
            guild.systemChannel) ||
            undefined,
          `Welcome, ${member}! Unfortunately, there was an error trying to ${
            enabledRoles ? 'assign roles to you' : ''
          }${enabledAll ? ' and/or ' : ''}${
            enabledNickname ? 'set your nickname' : ''
          }.${
            owner
              ? `
${owner} sorry, but you have to do this yourself.`
              : ''
          }`
        )
      }

      removeMember(guilds, member).catch(error =>
        handleError(
          client,
          error,
          `Removing member from DB failed (member ${member.id}, flags ${flags})`
        )
      )
    }
  }

  const guildMemberRemove: Listener<'guildMemberRemove'> = async member => {
    if (member.guild.id === guild.id) {
      await addMemberRejoinInfo(
        database,
        enabledRoles,
        enabledNickname,
        member
      ).catch(async error => {
        const owner = await undefinedIfRejected(guild.fetchOwner())
        handleError(
          client,
          error,
          `Rejoin guildMemberRemove failed (member ${member.id}, flags ${flags})`,
          (!guild.systemChannelFlags.has('SUPPRESS_JOIN_NOTIFICATIONS') &&
            guild.systemChannel) ||
            undefined,
          `${
            member.displayName
          } has left the server. Unfortunately, there was an error trying to save their ${
            enabledRoles ? 'roles' : ''
          }${enabledAll ? ' and/or ' : ''}${
            enabledNickname ? 'nickname' : ''
          }.${
            owner
              ? `
  ${owner} sorry, but when they rejoin, you may have to manually ${
                  enabledRoles ? 'assign their roles' : ''
                }${enabledAll ? ' and/or ' : ''}${
                  enabledNickname ? 'set their nickname' : ''
                }.`
              : ''
          }`
        )
      })
    }
  }
  client
    .on('guildMemberAdd', guildMemberAdd)
    .on('guildMemberRemove', guildMemberRemove)
    .rejoinListeners.set(guild.id, {
      guildMemberAdd,
      guildMemberRemove
    })
}

const getRejoinStatus = async (
  {channel, guild}: GuildMessage,
  database: Db
): Promise<void> => {
  const rejoinFlags = await fetchValue(database, 'guilds', guild, 'rejoinFlags')
  await channel.send(
    rejoinFlags === undefined
      ? 'Disabled'
      : [
          ...(rejoinFlags & MemberRejoinFlags.Roles ? ['Roles'] : []),
          ...(rejoinFlags & MemberRejoinFlags.Nickname ? ['Nicknames'] : [])
        ].join(', ')
  )
}

const checkIfAdmin = async (message: GuildMessage): Promise<boolean> => {
  if (
    message.member.permissions.has('ADMINISTRATOR') &&
    message.author.id !== me
  ) {
    await message.reply(
      'This command can only be used by someone with the Manage Messages permission or the bot owner!'
    )
    return false
  }
  return true
}

const enable = async (
  message: GuildMessage,
  database: Db,
  mode?: string
): Promise<void> => {
  // Check permissions, validate input
  if (!(await checkIfAdmin(message))) return
  const flags =
    mode === 'roles' || mode === 'r'
      ? MemberRejoinFlags.Roles
      : mode === 'nickname' || mode === 'n'
      ? MemberRejoinFlags.Nickname
      : mode === 'all' || mode === 'a' || mode === undefined
      ? MemberRejoinFlags.All
      : undefined
  if (flags === undefined) {
    await message.reply(`${mode} is not valid!
Valid options: roles, nickname, all`)
    return
  }
  if (
    !(await checkPermissions(message, [
      ...(flags & MemberRejoinFlags.Roles ? (['MANAGE_ROLES'] as const) : []),
      ...(flags & MemberRejoinFlags.Nickname
        ? (['MANAGE_NICKNAMES'] as const)
        : [])
    ]))
  )
    return

  const {client, channel, guild} = message
  addListeners(client, guild, database, flags)
  await setValue(database, 'guilds', guild, 'rejoinFlags', flags)
  await channel.send('Successfully enabled! Noot noot.')
}

const disable = async (message: GuildMessage, database: Db): Promise<void> => {
  if (!(await checkIfAdmin(message))) return
  const {channel, client, guild} = message
  const listeners = client.rejoinListeners.get(guild.id)
  if (!listeners) {
    await channel.send('Already disabled! Noot noot.')
    return
  }
  await disableRejoin(database, guild)
  client.off('guildMemberAdd', listeners.guildMemberAdd)
  client.off('guildMemberRemove', listeners.guildMemberRemove)
  client.rejoinListeners.delete(guild.id)
}

const command: GuildOnlyCommand = {
  name: 'rejoin',
  aliases: ['re', 'rj'],
  description:
    'Manages settings for what to do when a member rejoins this server.',
  syntax: '[e(nable) [r(oles)|n(ickname)|a(ll)]]|[d(isable)]',
  usage: `This command has 3 subcommands.
\`rejoin\`
See this server’s rejoining configuration.

\`rejoin e(nable) [r(oles)|n(ickname)|a(ll)]\`
Enables adding a member’s past roles, nickname, or both of these. Defaults to \`all\`.

\`rejoin d(isable)\`
Stops doing anything when a member rejoins this server.`,
  guildOnly: true,
  cooldown: 10,
  async execute(message, {args: [subcommand, mode]}, database) {
    switch (subcommand) {
      case 'enable':
      case 'e':
        await enable(message, database, mode)
        break
      case 'disable':
      case 'd':
        await disable(message, database)
        break
      default:
        await getRejoinStatus(message, database)
    }
  }
}
export default command
