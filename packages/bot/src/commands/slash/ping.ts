import {SlashCommandBuilder} from 'discord.js'
import type {AnySlashCommand} from '../../types'

const command: AnySlashCommand = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Gets my current latency.'),
	async execute(interaction) {
		const responseInteraction = await interaction.reply('Pinging…')
		await interaction.editReply(`Noot noot!
Latency: ${Date.now() - responseInteraction.interaction.createdTimestamp} ms
Websocket: ${interaction.client.ws.ping} ms`)
	}
}
export default command
