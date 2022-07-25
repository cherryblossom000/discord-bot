import {inlineCode} from '@discordjs/builders'
import {
	debugInteractionDetails,
	handleError,
	type CollectionValue,
	type KeysMatching
} from '../utils.js'
import type {Collection} from 'discord.js'
import type {Client, EventListener} from '../Client'
import type {Db} from '../database'
import type {Command, CommandInteraction} from '../types'

const handleInteractionError =
	(interaction: CommandInteraction) =>
	(error: unknown): void =>
		handleError(
			interaction.client,
			error,
			`Command ${inlineCode(interaction.commandName)} failed
${debugInteractionDetails(interaction)}`,
			{to: interaction}
		)

const listener: EventListener<'interactionCreate'> = (client, database) => {
	const runCommand = async <
		K extends KeysMatching<Client, Collection<string, Command>>
	>(
		interaction: CommandInteraction,
		key: K
	): Promise<void> => {
		const {commandName} = interaction
		const command = (
			client[key] as Collection<string, CollectionValue<Client[K]>>
		).get(commandName)
		if (!command) {
			handleError(client, new Error(`Command ${commandName} not found`))
			return
		}

		await (
			command as {
				execute: (
					interaction: CommandInteraction,
					database: Db
				) => Promise<void>
			}
		)
			.execute(interaction, database)
			.catch(handleInteractionError(interaction))
	}

	return async (interaction): Promise<void> => {
		if (interaction.isCommand()) await runCommand(interaction, 'slashCommands')
		else if (interaction.isMessageContextMenu())
			await runCommand(interaction, 'messageCommands')
		else if (interaction.isUserContextMenu())
			await runCommand(interaction, 'userCommands')
	}
}
export default listener
