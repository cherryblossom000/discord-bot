import {botDistFolder} from './folders.js'
import {importFolder} from '@comrade-pingu/bot/dist/src/utils.js'
import type {
	MessageContextMenuCommand,
	SlashCommand,
	UserContextMenuCommand
} from '@comrade-pingu/bot/dist/src/types'

const commandsFolder = new URL('src/commands/', botDistFolder)

const importCommands = async <T>(folder: string): Promise<readonly T[]> =>
	(await importFolder<T>(commandsFolder, folder)).map(([, command]) => command)

export const slashCommands = await importCommands<SlashCommand>('slash')
export const messageCommands = await importCommands<MessageContextMenuCommand>(
	'message'
)
export const userCommands = await importCommands<UserContextMenuCommand>('user')
