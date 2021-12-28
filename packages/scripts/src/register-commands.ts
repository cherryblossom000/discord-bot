import {REST} from '@discordjs/rest'
import {ApplicationCommandType, Routes} from 'discord-api-types/v9'
import dotenv from 'dotenv'
import {dev} from '@comrade-pingu/bot/dist/src/constants.js'
import {messageCommands, slashCommands, userCommands} from './commands.js'
import exitOnError from './exit-on-error.js'
import type {
  RESTPutAPIApplicationCommandsJSONBody,
  RESTPostAPIContextMenuApplicationCommandsJSONBody
} from 'discord-api-types/v9'
import type {ContextMenuCommand} from '@comrade-pingu/bot/dist/src/types'

exitOnError()
dotenv.config()

const applicationId = process.env.APP_ID!
const rest = new REST({version: '9'}).setToken(process.env.TOKEN!)

const contextMenuCommandToJSON =
  (type: ApplicationCommandType.Message | ApplicationCommandType.User) =>
  ({
    name
  }: ContextMenuCommand): RESTPostAPIContextMenuApplicationCommandsJSONBody => ({
    type,
    name
  })

const body: RESTPutAPIApplicationCommandsJSONBody = [
  ...slashCommands.map(({data}) => data.toJSON()),
  ...userCommands.map(contextMenuCommandToJSON(ApplicationCommandType.User)),
  ...messageCommands.map(
    contextMenuCommandToJSON(ApplicationCommandType.Message)
  )
]

await rest.put(
  dev
    ? Routes.applicationGuildCommands(applicationId, process.env.TEST_GUILD_ID!)
    : Routes.applicationCommands(applicationId),
  {body}
)
