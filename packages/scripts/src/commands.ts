import {botDistFolder} from './folders.js'
import {importFolder} from '@comrade-pingu/bot/dist/src/utils.js'
import type {
  ContextMenuCommand,
  SlashCommand
} from '@comrade-pingu/bot/dist/src/types'

const commandsFolder = new URL('src/commands/', botDistFolder)

const importCommands = async <T>(folder: string): Promise<readonly T[]> =>
  (await importFolder<T>(commandsFolder, folder)).map(([, command]) => command)

export const slashCommands = await importCommands<SlashCommand>('slash')
export const userCommands = await importCommands<ContextMenuCommand>('user')
export const messageCommands = await importCommands<ContextMenuCommand>(
  'message'
)
