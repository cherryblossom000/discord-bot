import {SlashCommandBuilder} from 'discord.js'
import type {AnySlashCommand} from '../../types'

const EMOJI = 'emoji'

const command: AnySlashCommand = {
	data: new SlashCommandBuilder()
		.setName('emoji')
		.setDescription('Gets the image for an emoji.')
		.addStringOption(option =>
			option
				.setName(EMOJI)
				.setRequired(true)
				.setDescription('The emoji to get the image of.')
		),
	async execute(interaction) {
		const input = interaction.options.getString(EMOJI, true)
		const match = (
			/<(a?):[\w]+:(\d+)>/u as {
				exec(
					string: string
				): (RegExpExecArray & [string, string, string]) | null
			}
		).exec(input)
		if (!match) {
			await interaction.reply('Please provide an emoji!')
			return
		}

		const [, animated, id] = match
		await interaction.reply({
			files: [interaction.client.rest.cdn.emoji(id, animated ? 'gif' : 'png')]
		})
	}
}
export default command
