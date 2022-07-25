import {REST} from '@discordjs/rest'
import {
	ApplicationCommandType,
	Routes,
	type RESTPutAPIApplicationCommandsJSONBody,
	type RESTPostAPIContextMenuApplicationCommandsJSONBody
} from 'discord-api-types/v9'
import {dev} from '@comrade-pingu/bot/dist/src/constants.js'
import {messageCommands, slashCommands, userCommands} from './commands.js'
import exitOnError from './exit-on-error.js'
import type {ContextMenuCommand} from '@comrade-pingu/bot/dist/src/types'
import 'dotenv/config'

exitOnError()

const applicationId = process.env.APP_ID!
const rest = new REST({version: '9'}).setToken(process.env.DISCORD_TOKEN!)

const contextMenuCommandToJSON =
	(type: ApplicationCommandType.Message | ApplicationCommandType.User) =>
	({
		data
	}: ContextMenuCommand): RESTPostAPIContextMenuApplicationCommandsJSONBody =>
		// TODO: fix types
		data
			.setType(type)
			.toJSON() as RESTPostAPIContextMenuApplicationCommandsJSONBody

const body: RESTPutAPIApplicationCommandsJSONBody = [
	...slashCommands.map(({data}) => data.toJSON()),
	...messageCommands.map(
		contextMenuCommandToJSON(ApplicationCommandType.Message)
	),
	...userCommands.map(contextMenuCommandToJSON(ApplicationCommandType.User))
]

await rest.put(
	dev
		? Routes.applicationGuildCommands(applicationId, process.env.TEST_GUILD_ID!)
		: Routes.applicationCommands(applicationId),
	{body}
)
