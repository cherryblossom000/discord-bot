import {join} from 'path'
import {promises} from 'fs'
import {Collection, Constants} from 'discord.js'
import escapeRegex from 'escape-string-regexp'
import express from 'express'
import Client from './Client'
import {connect, getPrefix} from './database'
import {createResolve, handleError, sendMeError} from './helpers'
import type {AddressInfo} from 'net'
import type {Snowflake} from 'discord.js'
import type {Command, GuildMessage, Message, RegexCommand} from './types'

const {readdir} = promises
const resolve = createResolve(__dirname)

const dev = process.env.NODE_ENV !== 'production'

// eslint-disable-next-line max-statements -- main
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
    ws: {intents: [
      'GUILDS',
      'GUILD_MESSAGES',
      'GUILD_MESSAGE_REACTIONS',
      'GUILD_EMOJIS',
      'GUILD_VOICE_STATES',
      'GUILD_PRESENCES',
      'DIRECT_MESSAGES'
    ]}
  })

  // Handle promise rejections and uncaught exceptions
  if (dev) {
    process.on('unhandledRejection', reason => {
      throw reason instanceof Error ? reason : new Error(`${reason}`)
    })
  } else {
    process.on('unhandledRejection', async reason =>
      handleError(client, reason instanceof Error ? reason : new Error(`${reason}`), 'Uncaught promise rejection:'))
    process.on('uncaughtException', async error => handleError(client, error, 'Uncaught exception:'))
  }

  // Connect to database
  const database = await connect(process.env.DB_USER!, process.env.DB_PASSWORD!, process.env.DB_NAME!)

  const importCommands = async <T>(path: string, callback: (command: T) => void): Promise<void> => {
    try {
      const files = await readdir(resolve(path))
      const modules = await Promise.all(files
        .filter(f => !f.endsWith('.map'))
        .map(async f => import(join(resolve(path), f))))
      modules.map(m => (m as {default: T}).default).forEach(callback)
    } catch (error) {
      await sendMeError(client, error, `\`importCommands\` failed with path \`${path}\`.`)
      throw error
    }
  }

  // Initialise cooldowns
  const cooldowns = new Collection<string, Collection<Snowflake, number>>()

  const executeRegexCommands = (message: Message): void => {
  // Regex message commands
    client.regexCommands.forEach(async (regexMessage, regex) => {
      if (regex.test(message.content)) {
        try {
          await (typeof regexMessage === 'string'
            ? message.channel.send(regexMessage)
            : message.channel.send(regexMessage(message)))
        } catch (error) {
          await handleError(
            client,
            error,
            `Regex command with regex \`${regex}\` failed with message content \`${message.content}\`.`,
            message
          )
        }
      }
    })
  }

  // Ready
  client.once('ready', async () => {
    await client.setActivity()
    console.log(`READY
Users: ${client.users.cache.size}
Channels: ${client.channels.cache.size}
Guilds: ${client.guilds.cache.size}`)
  })

  // Errors
  client.on('error', async error => sendMeError(client, error, 'The `error` event fired.'))

  // Guild create
  client.on('guildCreate', async () => client.setActivity())

  // Guild delete
  client.on('guildDelete', async () => client.setActivity())

  // Commands
  client.on('message', async message => {
    const now = Date.now()
    const {author, content, channel, guild} = message

    if (author.bot) return

    const prefix = await getPrefix(database, guild)
    const matchedPrefix = new RegExp(`^(<@!?${client.user!.id}>|${escapeRegex(prefix)})`, 'u').exec(content)?.[0]
    if (matchedPrefix !== undefined || !guild) {
      const input = content.slice(matchedPrefix?.length ?? 0).trim()

      // Exits if there is no input and the bot was mentioned
      if (!input.length && matchedPrefix !== prefix) {
        return channel.send(`Hi, I am Comrade Pingu. Noot noot.
My prefix is \`${prefix}\`. Run \`${prefix}help\` for a list of commands.`)
      }

      // Get args and command
      const args = input.split(/\s+/u)
      const commandName = args.shift()!.toLowerCase()

      const checkCommand = async (command?: Command<boolean>): Promise<boolean> => {
      // If command doesn't exist exit or execute regex commands
        if (!command) {
          if (!message.guild) executeRegexCommands(message)
          return false
        }

        const {args: commandArgs = false, guildOnly = false} = command
        // Guild only
        if (guildOnly && channel.type !== 'text') {
          await message.sendDeletableMessage({
            reply: true, content: 'sorry, I can\u2019t execute that command inside DMs. Noot noot.'
          })
          return false
        }

        // If no args
        if (commandArgs && !args.length) {
          await message.sendDeletableMessage({
            reply: true,
            content: `you didn\u2019t provide any arguments. Noot noot.
The syntax is: \`${prefix}${command.name}${command.syntax === undefined ? '' : ` ${command.syntax}`}\`. Noot noot.`
          })
          return false
        }
        return true
      }
      const command = client.commands.get(commandName) ??
      client.commands.find(({aliases = []}) => aliases.includes(commandName))
      if (!await checkCommand(command)) return

      if (!dev) {
        const checkCooldowns = async (): Promise<boolean> => {
          if (!cooldowns.has(command!.name)) cooldowns.set(command!.name, new Collection())

          const timestamps = cooldowns.get(command!.name)!
          const cooldownAmount = (command!.cooldown ?? 3) * 1000
          if (timestamps.has(author.id)) {
            const expirationTime = timestamps.get(author.id)! + cooldownAmount
            if (now < expirationTime) {
              const timeLeft = ((expirationTime - now) / 1000).toFixed(1)
              const msg = await message.reply(`please wait ${timeLeft} more second${timeLeft === '1.0' ? '' : 's'
              } before using the \`${command!.name}\` command. Noot noot.`)
              // Can't use delete with timeout because I need to return false before waiting 10 seconds
              client.setTimeout(async () => {
                await msg.delete()
                await message.delete().catch(e => {
                  if ((e as {code?: number}).code !== Constants.APIErrors.MISSING_PERMISSIONS) throw e
                })
              }, 5_000)
              return false
            }
          }
          timestamps.set(author.id, now)
          setTimeout(() => timestamps.delete(author.id), cooldownAmount)
          return true
        }
        if (!await checkCooldowns()) return
      }

      // Execute command
      try {
        await command!.execute(message as GuildMessage, {args, input: input.replace(new RegExp(`^${commandName}\\s*`, 'u'), '')}, database)
      } catch (error) {
        await handleError(
          client,
          error,
          `Command \`${command!.name}\` failed${args.length ? ` with args ${args.map(a => `\`${a}\``).join(', ')}` : ''}.`,
          message
        )
      }
    } else executeRegexCommands(message)
  })

  // Initialise commands
  await Promise.all([
    importCommands<Command>('./commands', c => client.commands.set(c.name, c)),
    importCommands<RegexCommand>('./regex-commands', c => client.regexCommands.set(c.regex, c.regexMessage))
  ])
  const listener = app.listen(process.env.PORT, () => {
    if (dev) console.log(`http://localhost:${(listener.address() as AddressInfo).port}`)
  })
  await client.login(process.env.TOKEN)
})().catch(e => console.error('Error in main function:', e))
