import {SlashCommandBuilder, hyperlink} from '@discordjs/builders'
import {checkPermissions} from '../../utils.js'
import type {AnySlashCommand} from '../../types'

const IWMELC = 'I will murder every last capitalist'
const HTKB = 'how to kiss boy'

const enum Meme {
	/* eslint-disable @typescript-eslint/no-shadow -- not using enum names in enum values */
	IWMELC = 'iwmelc',
	HTKB = 'htkb'
	/* eslint-enable @typescript-eslint/no-shadow */
}

const imagesFolder = new URL('../../../assets/img/', import.meta.url)
const iwmelc = new URL('iwmelc.jpg', imagesFolder).pathname
const htkb = new URL('htkb.jpg', imagesFolder).pathname

const MEME = 'meme'

const command: AnySlashCommand = {
	data: new SlashCommandBuilder()
		.setName('meme')
		.setDescription('Gets a Pingu-related meme.')
		.addStringOption(option =>
			option
				.setName(MEME)
				.setDescription('The meme to get.')
				.setRequired(true)
				.addChoices(
					{name: IWMELC, value: Meme.IWMELC},
					{name: HTKB, value: Meme.HTKB}
				)
		),
	usage: `!${hyperlink(
		IWMELC,
		'./assets/img/iwmelc.jpg'
	)}<br><img src="./assets/img/htkb.jpg" alt="${HTKB}" width="320">`,
	async execute(interaction) {
		if (!(await checkPermissions(interaction, 'ATTACH_FILES'))) return
		await interaction.reply({
			files: [
				interaction.options.getString(MEME, true) === Meme.IWMELC
					? iwmelc
					: htkb
			]
		})
	}
}
export default command
