import {SlashCommandBuilder} from '@discordjs/builders'
import type {GuildMember} from 'discord.js'
import {
  MemberRejoinFlags,
  addMemberRejoinInfo,
  collection,
  fetchMemberRejoinInfo,
  fetchValue,
  removeMember,
  setValue,
  disableRejoin
} from '../../database.js'
import {checkPermissions, fetchGuild, handleError} from '../../utils.js'
// eslint-disable-next-line import/no-named-default -- can't because type import
import type {default as Client, Listener} from '../../Client'
import type {Db} from '../../database'
import type {
  Guild,
  GuildSlashCommandInteraction,
  GuildOnlySlashCommand
} from '../../types'

const fetchOwner = async (guild: Guild): Promise<GuildMember | undefined> =>
  // eslint-disable-next-line unicorn/no-useless-undefined -- undefined not void
  guild.fetchOwner().catch(() => undefined)

const enum Mode {
  Roles = 'roles',
  Nickname = 'nickname',
  Both = 'both'
}

const modeToFlags: Readonly<Record<Mode, MemberRejoinFlags>> = {
  [Mode.Roles]: MemberRejoinFlags.Roles,
  [Mode.Nickname]: MemberRejoinFlags.Nickname,
  [Mode.Both]: MemberRejoinFlags.Both
}

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
      } catch (error) {
        const owner = await fetchOwner(guild)
        handleError(
          client,
          error,
          `Rejoin guildMemberAdd failed (member ${member.id}, flags ${flags})`,
          {
            to:
              (!guild.systemChannelFlags.has('SUPPRESS_JOIN_NOTIFICATIONS') &&
                guild.systemChannel) ||
              undefined,
            response: `Welcome, ${member}! Unfortunately, there was an error trying to ${
              enabledRoles ? 'assign roles to you' : ''
            }${enabledAll ? ' and/or ' : ''}${
              enabledNickname ? 'set your nickname' : ''
            }.${
              owner
                ? `
${owner} sorry, but you have to do this yourself.`
                : ''
            }`
          }
        )
        return
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
        const owner = await fetchOwner(guild)
        handleError(
          client,
          error,
          `Rejoin guildMemberRemove failed (member ${member.id}, flags ${flags})`,
          {
            to:
              (!guild.systemChannelFlags.has('SUPPRESS_JOIN_NOTIFICATIONS') &&
                guild.systemChannel) ||
              undefined,
            response: `${
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
          }
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

const status = async (
  interaction: GuildSlashCommandInteraction,
  database: Db
): Promise<void> => {
  const rejoinFlags = await fetchValue(
    database,
    'guilds',
    interaction.guildId,
    'rejoinFlags'
  )
  await interaction.reply(
    rejoinFlags === undefined
      ? 'Disabled'
      : [
          ...(rejoinFlags & MemberRejoinFlags.Roles ? ['Roles'] : []),
          ...(rejoinFlags & MemberRejoinFlags.Nickname ? ['Nicknames'] : [])
        ].join(', ')
  )
}

const checkIfAdmin = async (
  interaction: GuildSlashCommandInteraction,
  guild: Guild
): Promise<boolean> => {
  if (
    (await guild.members.fetch(interaction.user.id)).permissions.has(
      'ADMINISTRATOR'
    )
  ) {
    await interaction.reply(
      'This command can only be used by someone with the Manage Messages permission or the bot owner!'
    )
    return false
  }
  return true
}

const set = async (
  interaction: GuildSlashCommandInteraction,
  mode: Mode,
  database: Db
): Promise<void> => {
  const guild = await fetchGuild(interaction)
  if (!(await checkIfAdmin(interaction, guild))) return

  const flags = modeToFlags[mode]
  if (
    !(await checkPermissions(interaction, [
      ...(flags & MemberRejoinFlags.Roles ? (['MANAGE_ROLES'] as const) : []),
      ...(flags & MemberRejoinFlags.Nickname
        ? (['MANAGE_NICKNAMES'] as const)
        : [])
    ]))
  )
    return

  addListeners(interaction.client, guild, database, flags)
  await setValue(database, 'guilds', interaction.guildId, 'rejoinFlags', flags)
  await interaction.reply('Successfully enabled! Noot noot.')
}

const disable = async (
  interaction: GuildSlashCommandInteraction,
  database: Db
): Promise<void> => {
  const guild = await fetchGuild(interaction)
  if (!(await checkIfAdmin(interaction, guild))) return

  const {client, guildId} = interaction
  const listeners = client.rejoinListeners.get(guildId)
  if (!listeners) {
    await interaction.reply('Already disabled! Noot noot.')
    return
  }

  await disableRejoin(database, await fetchGuild(interaction))
  client
    .off('guildMemberAdd', listeners.guildMemberAdd)
    .off('guildMemberRemove', listeners.guildMemberRemove)
    .rejoinListeners.delete(guildId)
}

const STATUS = 'status'
const SET = 'set'
const MODE = 'mode'
const DISABLE = 'disable'

const command: GuildOnlySlashCommand = {
  data: new SlashCommandBuilder()
    .setName('rejoin')
    .setDescription(
      'Manages settings for what to do when a member rejoins this server.'
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName(STATUS)
        .setDescription('Get this server’s rejoining configuration.')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName(SET)
        .setDescription('Configure what I do when a member rejoins the server.')
        .addStringOption(option =>
          option
            .setName(MODE)
            .setDescription('What to restore when a member rejoins the server.')
            .setRequired(true)
            .addChoices([
              ['roles', Mode.Roles],
              ['nickname', Mode.Nickname],
              ['both', Mode.Both]
            ])
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName(DISABLE)
        .setDescription(
          'Stops doing anything when a member rejoins this server.'
        )
    ),
  guildOnly: true,
  async execute(interaction, database) {
    switch (interaction.options.getSubcommand()) {
      case STATUS:
        await status(interaction, database)
        break
      case SET:
        await set(
          interaction,
          interaction.options.getString(MODE, true) as Mode,
          database
        )
        break
      case DISABLE:
        await disable(interaction, database)
    }
  }
}
export default command
