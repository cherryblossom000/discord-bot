import {readFile} from 'node:fs/promises'
import {
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	SlashCommandBuilder,
	type InteractionReplyOptions
} from 'discord.js'
import type {PackageJson} from 'type-fest'
import type {AnySlashCommand} from '../../types'

const {homepage} = JSON.parse(
	await readFile(
		new URL('../../../package.json', import.meta.url).pathname,
		'utf8'
	)
) as PackageJson

const options: InteractionReplyOptions = {
	content: 'Here’s my website!',
	components: [
		{
			type: ComponentType.ActionRow,
			components: [
				new ButtonBuilder({
					style: ButtonStyle.Link,
					label: 'Comrade Pingu Website',
					url: homepage
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
