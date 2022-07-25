import {SlashCommandBuilder} from 'discord.js'
import {checkPermissions, fetchGuild, replyDeletable} from '../../utils.js'
import type {GuildOnlySlashCommand} from '../../types'

const command: GuildOnlySlashCommand = {
	data: new SlashCommandBuilder()
		.setName('icon')
		.setDescription('Gets the server icon.')
		.setDMPermission(false),
	async execute(interaction) {
		if (!(await checkPermissions(interaction, ['AttachFiles']))) return
		const icon = (await fetchGuild(interaction)).iconURL({size: 4096})
		await replyDeletable(
			interaction,
			icon === null
				? 'This server doesn’t have an icon! Noot noot.'
				: {files: [icon]}
		)
	}
}
export default command
