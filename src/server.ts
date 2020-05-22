import {join} from 'path'
import {promises} from 'fs'
import {Collection} from 'discord.js'
import escapeRegex from 'escape-string-regexp'
import express from 'express'
import Keyv from 'keyv'
import {Client} from './types'
import {createResolve, getPrefix, handleError, reply, sendMeError} from './helpers'
import type {AddressInfo} from 'net'
import type {Server} from 'http'
import type {Snowflake} from 'discord.js'
import type {Command, DatabaseGuild, GuildMessage, Message, RegexCommand} from './types'

const {readdir} = promises,
  resolve = createResolve(__dirname)

const dev = process.env.NODE_ENV !== 'production'

// Routing
const app = express()

app.get('/', (_, res) => res.sendFile(resolve('../assets/html/index.html')))
app.use(express.static(resolve('../assets/html'), {extensions: ['html']}))
app.use(express.static(resolve('../assets/css')))
app.use(express.static(resolve('../assets/img')))

const client = new Client({
  disableMentions: 'everyone',
  ws: {intents: [
    'GUILDS', 'GUILD_MESSAGES', 'GUILD_EMOJIS', 'GUILD_VOICE_STATES', 'GUILD_PRESENCES', 'DIRECT_MESSAGES'
  ]}
})

// Handle promise rejections and uncaught exceptions
if (dev) {
  process.on('unhandledRejection', reason => {
    throw reason instanceof Error ? reason : new Error(`${reason}`)
  })
} else {
  process.on('unhandledRejection', reason =>
    handleError(client, reason instanceof Error ? reason : new Error(`${reason}`), 'Uncaught promise rejection:'))
  process.on('uncaughtException', error => handleError(client, error, 'Uncaught exception:'))
}

// Set up keyv
const database = new Keyv<DatabaseGuild>('sqlite://.data/database.sqlite')
database.on('error', error => {
  console.error(error)
  handleError(client, error, 'Keyv connection error:')
})

const importCommands = async <T>(path: string, callback: (command: T) => void): Promise<void> => {
  try {
    const files = await readdir(resolve(path)),
      modules = await Promise.all(files
        .filter(f => !f.endsWith('.map'))
        .map(async f => import(join(resolve(path), f))))
    modules.map<T>(m => m.default).forEach(callback)
  } catch (error) {
    sendMeError(client, error, `\`importCommands\` failed with path \`${path}\`.`)
    throw error
  }
}

// Initialise commands
importCommands<Command>('./commands', c => client.commands.set(c.name, c))
importCommands<RegexCommand>('./regex-commands', c => client.regexCommands.set(c.regex, c.regexMessage))

// Initialise cooldowns
const cooldowns = new Collection<string, Collection<Snowflake, number>>()

declare global {
  interface RegExp {
    toString(): string
  }
}

const executeRegexCommands = (message: Message): void => {
  // Regex message commands
  client.regexCommands.forEach(async (regexMessage, regex) => {
    if (regex.test(message.content)) {
      try {
        await (typeof regexMessage === 'string'
          ? message.channel.send(regexMessage)
          : message.channel.send(regexMessage(message)))
      } catch (error) {
        handleError(
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
client.once('ready', () => {
  client.setActivity()
  console.log(`READY
Users: ${client.users.cache.size}
Channels: ${client.channels.cache.size}
Guilds: ${client.guilds.cache.size}`)
})

// Errors
client.on('error', async error => sendMeError(client, error, 'The `error` event fired.'))

// Guild create
client.on('guildCreate', () => client.setActivity())

// Guild delete
client.on('guildDelete', () => client.setActivity())

// Commands
client.on('message', async message => {
  const now = Date.now(),
    {author, content, channel, guild} = message

  if (author.bot) return

  const prefix = await getPrefix(database, guild),
    matchedPrefix = new RegExp(`^(<@!?${client.user!.id}>|${escapeRegex(prefix)})`, 'u').exec(content)?.[0]
  if (matchedPrefix || !guild) {
    const input = content.slice(matchedPrefix?.length ?? 0).trim()

    // Exits if there is no input and the bot was mentioned
    if (!input.length && matchedPrefix !== prefix) {
      return channel.send(`Hi, I am Comrade Pingu. Noot noot.
My prefix is \`${prefix}\`. Run \`${prefix}help\` for a list of commands.`)
    }

    // Get args and command
    const args = input.split(/\s+/u),
      commandName = args.shift()!.toLowerCase()

    const checkCommand = (command?: Command<boolean>): command is Command<boolean> => {
      // If command doesn't exist exit or execute regex commands
      if (!command) {
        if (!message.guild) executeRegexCommands(message)
        return false
      }

      // Guild only
      if (command.guildOnly && channel.type !== 'text') {
        reply(message, 'sorry, I can\u2019t execute that command inside DMs. Noot noot.')
        return false
      }

      // If no args
      if (command.args && !args.length) {
        reply(message, `you didn\u2019t provide any arguments. Noot noot.
The syntax is: \`${prefix}${command.name}${command.syntax ? ` ${command.syntax}` : ''}\`. Noot noot.`)
        return false
      }
      return true
    }
    const command = client.commands.get(commandName) ?? client.commands.find(cmd => !!cmd.aliases?.includes(commandName))
    if (!checkCommand(command)) return

    if (!dev) {
      const checkCooldowns = (): boolean => {
        if (!cooldowns.has(command.name)) cooldowns.set(command.name, new Collection())

        const timestamps = cooldowns.get(command.name)!,
          cooldownAmount = command.cooldown ?? 3 * 1000
        if (timestamps.has(author.id)) {
          const expirationTime = timestamps.get(author.id)! + cooldownAmount
          if (now < expirationTime) {
            const timeLeft = ((expirationTime - now) / 1000).toFixed(1)
            reply(
              message,
              `please wait ${timeLeft} more second${timeLeft === '1.0' ? '' : 's'} before using the \`${command.name}\` command. Noot noot.`
            )
            return false
          }
        }
        timestamps.set(author.id, now)
        setTimeout(() => timestamps.delete(author.id), cooldownAmount)
        return true
      }
      if (!checkCooldowns()) return
    }

    // Execute command
    try {
      await command.execute(message as GuildMessage, {args, input: input.replace(new RegExp(`^${commandName}\\s*`, 'u'), '')}, database)
    } catch (error) {
      handleError(
        client,
        error,
        `Command \`${command.name}\` failed${args.length ? ` with args ${args.map(a => `\`${a}\``).join(', ')}` : ''}.`,
        message
      )
    }
  } else executeRegexCommands(message)
})

// Start server and login to Discord
;(async (): Promise<void> => {
  if (dev) {
    const dotenv = await import('dotenv')
    dotenv.config()
  }
  const listener: Server = app.listen(process.env.PORT, () => {
    if (dev) console.log(`http://localhost:${(listener.address() as AddressInfo).port}`)
  })
  client.login(process.env.TOKEN)
})()
