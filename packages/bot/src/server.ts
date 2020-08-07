import {promises} from 'fs'
import {join} from 'path'
import express from 'express'
import Client from './Client'
import {addListeners} from './commands/rejoin'
import {collection, connect} from './database'
import {cleanStack, createResolve, handleError, sendMeError} from './utils'
import type {AddressInfo} from 'net'
import type {ClientEvents, EventListener} from './Client'
import type {Command, RegexCommand} from './types'

const {readdir} = promises
const resolve = createResolve(__dirname)

const dev = process.env.NODE_ENV !== 'production'

;(async (): Promise<void> => {
  if (dev) {
    // eslint-disable-next-line node/no-unpublished-import -- dotenv is only needed to be imported in development
    const dotenv = await import('dotenv')
    dotenv.config()
  }

  // Routing
  const app = express()

  app.get('/', (_, res) => res.sendFile(resolve('../assets/html/index.html')))
  app.use(express.static(resolve('../assets/html'), {extensions: ['html']}))
  app.use(express.static(resolve('../assets/css')))
  app.use(express.static(resolve('../assets/img')))

  const client = new Client({
    disableMentions: 'everyone',
    ws: {
      intents: [
        // Guild create (logging in, presence)
        'GUILDS',
        // Roles and nicknames changing, members leaving and joining (rejoin)
        'GUILD_MEMBERS',
        // Guild commands
        'GUILD_MESSAGES',
        // Guild reactions
        'GUILD_MESSAGE_REACTIONS',
        // Presences in profile
        'GUILD_PRESENCES',
        // Members joining voice channels
        'GUILD_VOICE_STATES',
        // DM commands
        'DIRECT_MESSAGES',
        // DM reactions
        'DIRECT_MESSAGE_REACTIONS'
      ]
    }
  })

  // Handle promise rejections and uncaught exceptions
  if (dev) {
    process.on('unhandledRejection', reason => {
      throw reason instanceof Error ? reason : new Error(`${reason}`)
    })
  } else {
    process.on('unhandledRejection', async reason =>
      handleError(
        client,
        reason instanceof Error ? reason : new Error(`${reason}`),
        'Uncaught promise rejection:'
      )
    )
    process.on('uncaughtException', async error =>
      handleError(client, error, 'Uncaught exception:')
    )
  }

  // Connect to database
  const database = await connect(
    process.env.DB_USER!,
    process.env.DB_PASSWORD!,
    process.env.DB_NAME!
  )

  const importFolder = async <T>(
    path: string,
    // eslint-disable-next-line promise/prefer-await-to-callbacks -- easier to handle errors in one spot
    callback: (command: T, file: string) => void
  ): Promise<void> => {
    try {
      await Promise.all(
        (await readdir(resolve(path)))
          .filter(file => !file.endsWith('.map'))
          .map(async file =>
            // eslint-disable-next-line promise/prefer-await-to-callbacks -- see above
            callback(
              ((await import(join(resolve(path), file))) as {default: T})
                .default,
              file.slice(0, -3)
            )
          )
      )
    } catch (error) {
      await sendMeError(
        client,
        error,
        `\`importFolder\` failed with path \`${path}\`.`
      )
      throw error
    }
  }

  // Ready
  client.once('ready', async () => {
    await client.setActivity()

    // Initialise rejoin listeners
    await collection(database, 'guilds')
      .find({rejoinFlags: {$exists: true}}, {projection: {rejoinFlags: 1}})
      .forEach(({_id, rejoinFlags}) =>
        addListeners(
          client,
          client.guilds.cache.get(_id)!,
          database,
          rejoinFlags!
        )
      )

    console.log(`READY
  Users: ${client.users.cache.size}
  Channels: ${client.channels.cache.size}
  Guilds: ${client.guilds.cache.size}`)
  })

  // Initialise event listeners
  await importFolder<EventListener<keyof ClientEvents>>(
    'events',
    (listener, name) =>
      client.on(name as keyof ClientEvents, listener(client, database))
  )

  // Initialise commands
  await Promise.all([
    importFolder<Command>('commands', c => client.commands.set(c.name, c)),
    importFolder<RegexCommand>('regex-commands', c =>
      client.regexCommands.set(c.regex, c.regexMessage)
    )
  ])
  const listener = app.listen(process.env.PORT, () => {
    if (dev) {
      console.log(
        `http://localhost:${(listener.address() as AddressInfo).port}`
      )
    }
  })
  await client.login(process.env.TOKEN)
})().catch(error => console.error('Error in main function:', cleanStack(error)))
