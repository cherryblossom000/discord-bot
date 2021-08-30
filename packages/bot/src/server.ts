import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import Koa from 'koa'
import serve from 'koa-static'
import Client from './Client'
import {addListeners} from './commands/rejoin'
import {dev} from './constants'
import {connect, fetchRejoinGuilds} from './database'
import {cleanErrorsStack, createResolve, handleError} from './utils'
import type {AddressInfo} from 'net'
import type {ClientEvents, EventListener} from './Client'
import type {Command, RegexCommand} from './types'

dotenv.config()

const {readdir} = fs.promises
const resolve = createResolve(__dirname)

const assetsFolder = path.join(path.dirname(__dirname), 'assets')

;(async (): Promise<void> => {
  // Routing
  const app = new Koa()
  app
    .use(async (ctx, next) => {
      const _path = ctx.path.replace(/^\/|\/$/gu, '')
      let redirected: string
      switch (_path) {
        case 'index':
        case 'index.html':
          redirected = '/'
          break
        case 'changelog.html':
          redirected = '/changelog'
          break
        case 'license.html':
          redirected = '/license'
          break
        default:
          return next()
      }
      ctx.status = 301
      ctx.redirect(redirected)
    })
    .use(serve(path.join(assetsFolder, 'html'), {extensions: ['html']}))
    .use(serve(path.join(assetsFolder, 'css')))
    .use(serve(path.join(assetsFolder, 'img')))

  const client = new Client({
    disableMentions: 'everyone',
    ws: {
      intents: [
        // Guild create (logging in, presence)
        'GUILDS',
        // Roles and nicknames changing, members leaving and joining (rejoin),
        // fetching of members for trivia leaderboard
        'GUILD_MEMBERS',
        // Emoji command
        'GUILD_EMOJIS',
        // Guild reactions
        'GUILD_MESSAGE_REACTIONS',
        // Members joining voice channels
        'GUILD_VOICE_STATES',
        // Presences in profile
        'GUILD_PRESENCES',
        // Guild commands
        'GUILD_MESSAGES',
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
    process.on('unhandledRejection', reason =>
      handleError(
        client,
        reason instanceof Error ? reason : new Error(`${reason}`),
        'Uncaught promise rejection:'
      )
    )
    process.on('uncaughtException', error =>
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
    _path: string,
    callback: (command: T, file: string) => void
  ): Promise<void> => {
    try {
      await Promise.all(
        (await readdir(resolve(_path)))
          .filter(file => file.endsWith('.js'))
          .map(async file =>
            callback(
              ((await import(path.join(resolve(_path), file))) as {default: T})
                .default,
              file.slice(0, -3)
            )
          )
      )
    } catch (error: unknown) {
      handleError(
        client,
        error,
        `\`importFolder\` failed with path \`${_path}\`.`
      )
    }
  }

  // Ready
  client.once('ready', async () => {
    await client.setActivity()

    // Initialise rejoin listeners
    // eslint-disable-next-line unicorn/no-array-for-each -- not array
    await fetchRejoinGuilds(database).forEach(({_id, rejoinFlags}) =>
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
  const listener = app.listen(Number(process.env.PORT), () => {
    if (dev) {
      console.log(
        `http://localhost:${(listener.address() as AddressInfo).port}`
      )
    }
  })
  await client.login(process.env.TOKEN)
})().catch((error: unknown) =>
  console.error(
    'Error in main function:',
    error instanceof Error ? cleanErrorsStack(error) : error
  )
)
