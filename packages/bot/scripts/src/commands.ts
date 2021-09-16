import {importFolder} from '../../dist/src/utils.js'
import type {ContextMenuCommand, SlashCommand} from '../../src/types'

/* eslint-disable jsdoc/require-description-complete-sentence -- paths */
/** `packages/bot/scripts/` */
export const scriptsFolder = new URL('..', import.meta.url)
/** `packages/bot/` */
export const rootFolder = new URL('..', scriptsFolder)
/** `packages/bot/dist/` */
export const distFolder = new URL('dist/', rootFolder)
/* eslint-enable jsdoc/require-description-complete-sentence */

const commandsFolder = new URL('src/commands/', distFolder)

const importCommands = async <T>(folder: string): Promise<readonly T[]> =>
  (await importFolder<T>(commandsFolder, folder)).map(([, command]) => command)

export const slashCommands = await importCommands<SlashCommand>('slash')
export const userCommands = await importCommands<ContextMenuCommand>('user')
export const messageCommands = await importCommands<ContextMenuCommand>(
  'message'
)
