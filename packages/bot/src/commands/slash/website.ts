import {
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	SlashCommandBuilder,
	type InteractionReplyOptions
} from 'discord.js'
import type {AnySlashCommand} from '../../types'

const options: InteractionReplyOptions = {
	content: 'Here’s my website!',
	components: [
		{
			type: ComponentType.ActionRow,
			components: [
				new ButtonBuilder({
					style: ButtonStyle.Link,
					label: 'Comrade Pingu Website',
					url: 'https://comrade-pingu--cherryblossom00.repl.co'
				})
			]
		}
	]
}

const command: AnySlashCommand = {
	data: new SlashCommandBuilder()
		.setName('website')
		.setDescription('Sends my website.'),
	async execute(interaction) {
		await interaction.reply(options)
	}
}
export default command
