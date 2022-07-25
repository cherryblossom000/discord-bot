import {
	MemberRejoinFlags,
	addMemberRejoinInfo,
	collection,
	disableRejoin,
	fetchMemberRejoinInfo,
	fetchValue,
	removeMember,
	setValue,
	type Db
} from '../database.js'
import {checkPermissions, fetchGuild, handleError} from './utils.js'
import type {Guild, GuildMember} from 'discord.js'
import type {Client, Listener} from '../Client'
import type {GuildChatInputInteraction} from '../types'

export const enum RejoinMode {
	Roles = 'roles',
	Nickname = 'nickname',
	Both = 'both'
}

const rejoinModeToFlags: Readonly<Record<RejoinMode, MemberRejoinFlags>> = {
	[RejoinMode.Roles]: MemberRejoinFlags.Roles,
	[RejoinMode.Nickname]: MemberRejoinFlags.Nickname,
	[RejoinMode.Both]: MemberRejoinFlags.Roles | MemberRejoinFlags.Nickname
}

const fetchOwner = async (guild: Guild): Promise<GuildMember | undefined> =>
	// eslint-disable-next-line unicorn/no-useless-undefined -- undefined not void
	guild.fetchOwner().catch(() => undefined)

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
				const {roles, nickname} = await fetchMemberRejoinInfo(
					guilds,
					member.guild.id,
					member.id
				)
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
							(!guild.systemChannelFlags.has('SuppressJoinNotifications') &&
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

			removeMember(guilds, member.guild.id, member.id).catch(error =>
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
							(!guild.systemChannelFlags.has('SuppressJoinNotifications') &&
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

export const status = async (
	interaction: GuildChatInputInteraction,
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

export const set = async (
	interaction: GuildChatInputInteraction,
	database: Db,
	mode: RejoinMode
): Promise<void> => {
	const flags = rejoinModeToFlags[mode]
	const guild = await fetchGuild(interaction)
	if (
		!(await checkPermissions(interaction, [
			...(flags & MemberRejoinFlags.Roles ? (['ManageRoles'] as const) : []),
			...(flags & MemberRejoinFlags.Nickname
				? (['ManageNicknames'] as const)
				: [])
		]))
	)
		return

	addListeners(interaction.client, guild, database, flags)
	await setValue(database, 'guilds', interaction.guildId, 'rejoinFlags', flags)
	await interaction.reply('Successfully enabled! Noot noot.')
}

export const disable = async (
	interaction: GuildChatInputInteraction,
	database: Db
): Promise<void> => {
	const {client, guildId} = interaction
	const listeners = client.rejoinListeners.get(guildId)
	if (!listeners) {
		await interaction.reply('Already disabled! Noot noot.')
		return
	}

	await disableRejoin(database, guildId)
	client
		.off('guildMemberAdd', listeners.guildMemberAdd)
		.off('guildMemberRemove', listeners.guildMemberRemove)
		.rejoinListeners.delete(guildId)
}
