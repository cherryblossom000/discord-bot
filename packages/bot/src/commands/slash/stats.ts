import {SlashCommandBuilder} from 'discord.js'
import type {AnySlashCommand} from '../../types'

const command: AnySlashCommand = {
	data: new SlashCommandBuilder()
		.setName('stats')
		.setDescription('Gets my stats.'),
	async execute(interaction) {
		const {
			client: {channels, guilds, users}
		} = interaction
		await interaction.reply(`Users: ${users.cache.size}
Channels: ${channels.cache.size}
Guilds: ${guilds.cache.size}`)
	}
}
export default command
