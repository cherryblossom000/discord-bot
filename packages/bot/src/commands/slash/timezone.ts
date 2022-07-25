import {SlashCommandBuilder, hyperlink, inlineCode} from '@discordjs/builders'
import {fetchTimeZone, setValue} from '../../database.js'
import type {AnySlashCommand} from '../../types'

const TIMEZONE = 'timezone'

const command: AnySlashCommand = {
	data: new SlashCommandBuilder()
		.setName('timezone')
		.setDescription(
			`Manages time zone preferences for commands such as ${inlineCode(
				'profile'
			)} that show times.`
		)
		.addStringOption(option =>
			option
				.setName(TIMEZONE)
				.setDescription(
					'An IANA time zone. Spaces will be automatically converted into underscores.'
				)
		),
	usage: `See ${hyperlink(
		'here',
		'https://en.wikipedia.org/wiki/List_of_tz_database_time_zones'
	)} for a list of timezones.`,
	async execute(interaction, database) {
		const input = interaction.options.getString(TIMEZONE)
		if (input === null) {
			await interaction.reply(
				`Your current time zone is set to ${await fetchTimeZone(
					database,
					interaction.user.id
				)}.`
			)
			return
		}

		const timeZone = input.replaceAll(' ', '_')
		try {
			// Verify that it's a valid time zone
			new Date().toLocaleString(undefined, {timeZone})
		} catch (error) {
			if (error instanceof RangeError) {
				await interaction.reply(
					`${inlineCode(timeZone)} is not a valid time zone!`
				)
				return
			}
			throw error
		}

		await setValue(database, 'users', interaction.user.id, 'timeZone', timeZone)
		await interaction.reply(
			`successfully changed time zone to ${inlineCode(timeZone)}.`
		)
	}
}
export default command
