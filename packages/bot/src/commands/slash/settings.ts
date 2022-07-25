import {SlashCommandBuilder, bold} from 'discord.js'
import {emojis} from '../../constants.js'
import {fetchValue, setValue, type Db} from '../../database.js'
import {checkPermissions} from '../../utils.js'
import * as rejoin from '../../utils/rejoin.js'
import {RejoinMode} from '../../utils/rejoin.js'
import type {
	GuildOnlySlashCommand,
	GuildChatInputInteraction
} from '../../types'

const COLOUR = 'colour'
const PIN = 'pin'
const REJOIN = 'rejoin'

const STATUS = 'status'
const ENABLE = 'enable'
const DISABLE = 'disable'
const SET = 'set'
const MODE = 'mode'

const statusMessage = (boolean: boolean, string: string): string =>
	`${boolean ? emojis.tick : emojis.cross} Users ${bold(
		`can${boolean ? '' : 'not'}`
	)} ${string}.`

const colour = async (
	subcommand: string,
	interaction: GuildChatInputInteraction,
	database: Db
): Promise<void> => {
	if (subcommand === STATUS) {
		await interaction.reply(
			statusMessage(
				(await fetchValue(
					database,
					'guilds',
					interaction.guildId,
					'enableColourRoles'
				)) ?? false,
				'use /colour'
			)
		)
		return
	}

	const isEnable = subcommand === ENABLE
	if (isEnable && !(await checkPermissions(interaction, ['ManageRoles'])))
		return
	await setValue(
		database,
		'guilds',
		interaction.guildId,
		'enableColourRoles',
		isEnable
	)
	await interaction.reply(
		`Successfully ${bold(
			isEnable ? 'enabled' : 'disabled'
		)} /colour! Noot noot.`
	)
}

const pin = async (
	subcommand: string,
	interaction: GuildChatInputInteraction,
	database: Db
): Promise<void> => {
	if (subcommand === STATUS) {
		await interaction.reply(
			statusMessage(
				(await fetchValue(
					database,
					'guilds',
					interaction.guildId,
					'enablePinning'
				)) ?? false,
				'use ‘Pin Message'
			)
		)
		return
	}

	const isEnable = subcommand === ENABLE
	if (isEnable && !(await checkPermissions(interaction, ['ManageMessages'])))
		return
	await setValue(
		database,
		'guilds',
		interaction.guildId,
		'enablePinning',
		isEnable
	)
	await interaction.reply(
		`Successfully ${bold(isEnable ? 'enabled' : 'disabled')}! Noot noot.`
	)
}

const command: GuildOnlySlashCommand = {
	data: new SlashCommandBuilder()
		.setName('settings')
		.setDescription('Manage settings.')
		.setDMPermission(false)
		.setDefaultMemberPermissions(0)
		.addSubcommandGroup(group =>
			group
				.setName(COLOUR)
				.setDescription('Settings for /colour.')
				.addSubcommand(subcommand =>
					subcommand
						.setName(STATUS)
						.setDescription(
							'Get whether users are allowed to change their colour.'
						)
				)
				.addSubcommand(subcommand =>
					subcommand
						.setName(ENABLE)
						.setDescription('Enable allowing users to change their colour.')
				)
				.addSubcommand(subcommand =>
					subcommand
						.setName(DISABLE)
						.setDescription('Disable allowing users to change their colour.')
				)
		)
		.addSubcommandGroup(group =>
			group
				.setName(REJOIN)
				.setDescription(
					'Settings for what to do when a member rejoins this server.'
				)
				.addSubcommand(subcommand =>
					subcommand
						.setName(STATUS)
						.setDescription('Get this server’s rejoining configuration.')
				)
				.addSubcommand(subcommand =>
					subcommand
						.setName(SET)
						.setDescription(
							'Configure what I do when a member rejoins the server.'
						)
						.addStringOption(option =>
							option
								.setName(MODE)
								.setDescription(
									'What to restore when a member rejoins the server.'
								)
								.setRequired(true)
								.addChoices(
									{name: 'roles', value: RejoinMode.Roles},
									{name: 'nickname', value: RejoinMode.Nickname},
									{name: 'both', value: RejoinMode.Both}
								)
						)
				)
				.addSubcommand(subcommand =>
					subcommand
						.setName(DISABLE)
						.setDescription(
							'Stops doing anything when a member rejoins this server.'
						)
				)
		)
		.addSubcommandGroup(group =>
			group
				.setName(PIN)
				.setDescription('Settings for ‘Pin Message’.')
				.addSubcommand(subcommand =>
					subcommand
						.setName(STATUS)
						.setDescription('Get whether users are allowed to pin a message.')
				)
				.addSubcommand(subcommand =>
					subcommand
						.setName(ENABLE)
						.setDescription('Enable allowing anyone to pin a message.')
				)
				.addSubcommand(subcommand =>
					subcommand
						.setName(DISABLE)
						.setDescription('Disable allowing anyone to pin a message.')
				)
		),
	async execute(interaction, database) {
		const subcommand = interaction.options.getSubcommand(true)
		switch (interaction.options.getSubcommandGroup(true)) {
			case COLOUR:
				return colour(subcommand, interaction, database)
			case REJOIN:
				switch (subcommand) {
					case STATUS:
						return rejoin.status(interaction, database)
					case SET:
						return rejoin.set(
							interaction,
							database,
							interaction.options.getString(MODE, true) as RejoinMode
						)
					case DISABLE:
						return rejoin.disable(interaction, database)
				}
			case PIN:
				return pin(subcommand, interaction, database)
		}
	}
}
export default command
