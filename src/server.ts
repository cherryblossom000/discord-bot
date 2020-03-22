import {join} from 'path'
import {promises} from 'fs'
import {Collection} from 'discord.js'
import escapeRegex from 'escape-string-regexp'
import express from 'express'
import Keyv from 'keyv'
import {PinguClient} from './types'
import {createResolve, handleError, reply, sendMeError} from './helpers'
import {defaultPrefix} from './constants'

import type {AddressInfo} from 'net'
import type {Server} from 'http'
import type {Snowflake} from 'discord.js'
import type {Command, PinguMessage, RegexCommand} from './types'

const {readdir} = promises
const resolve = createResolve(__dirname)

const dev = process.env.NODE_ENV !== 'production'

// routing
const app = express()

app.get('/', (_, res) => res.sendFile(resolve('../assets/html/index.html')))
app.get('/license', (_, res) => res.sendFile(resolve('../assets/html/license.html')))
app.get('/changelog', (_, res) => res.sendFile(resolve('../assets/html/changelog.html')))
app.use(express.static(resolve('../assets/css')))
app.use(express.static(resolve('../assets/img')))

const client = new PinguClient()

// handle promise rejections and uncaught exceptions
if (!dev) {
  process.on('unhandledRejection', reason =>
    handleError(client, reason instanceof Error ? reason : new Error(`${reason}`), 'Uncaught promise rejection:')
  )
  process.on('uncaughtException', error => handleError(client, error, 'Uncaught exception:'))
}

// set up keyv
const prefixes = new Keyv<string>('sqlite://.data/database.sqlite')
prefixes.on('error', error => handleError(client, error, 'Keyv connection error:'))

const importCommands = async <T>(path: string, callback: (command: T) => void): Promise<void> => {
  try {
    const files = await readdir(resolve(path))
    const modules = await Promise.all(files
      .filter(f => !f.endsWith('.map'))
      .map(async f => import(join(resolve(path), f)))
    )
    modules.map<T>(m => m.default).forEach(callback)
  } catch (error) {
    sendMeError(client, error, `\`importCommands\` failed with path \`${path}\`.`)
    throw error
  }
}

// initialise commands
importCommands<Command>('./commands', c => client.commands.set(c.name, c))
importCommands<RegexCommand>('./regex-commands', c => client.regexCommands.set(c.regex, c.regexMessage))

// initialise cooldowns
const cooldowns = new Collection<string, Collection<Snowflake, number>>()

const executeRegexCommands = (message: PinguMessage): void => {
  // regex message commands
  client.regexCommands.forEach(async (regexMessage, regex) => {
    if (regex.test(message.content)) {
      try {
        await (typeof regexMessage === 'string'
          ? message.channel.send(regexMessage)
          : message.channel.send(regexMessage(message)))
      } catch (error) {
        handleError(client, error,
          `Regex command with regex \`${regex}\` failed with message content \`${message.content}\`.`, message
        )
      }
    }
  })
}

// ready
client.once('ready', () => {
  client.setActivity()
  console.log(`READY
Users: ${client.users.cache.size}
Channels: ${client.channels.cache.size}
Guilds: ${client.guilds.cache.size}`)
})

// errors
client.on('error', error => {
  sendMeError(client, error, 'The `error` event fired.')
})

// guild create
client.on('guildCreate', () => client.setActivity())

// guild delete
client.on('guildDelete', () => client.setActivity())

// commands
client.on('message', async (message: PinguMessage) => {
  const now = Date.now()
  const {author, content, channel} = message

  if (author?.bot) return

  const prefix = message.guild ? await prefixes.get(message.guild.id) ?? defaultPrefix : defaultPrefix
  const matchedPrefix = new RegExp(`^<@!?${client.user!.id}>|${escapeRegex(prefix)}`).exec(content)?.[0]
  if (matchedPrefix || !message.guild) {
    // exits if there is no input
    const input = content.slice(matchedPrefix?.length ?? 0).trim()
    if (!input.length && matchedPrefix !== prefix) {
      channel.send(`Hi, I am Comrade Pingu. Noot noot.
My prefix is \`${prefix}\`. Run \`${prefix} help\` for a list of commands.`)
      return
    }

    // get args
    const args = input.split(/\s+/)
    const commandName = args.shift()!.toLowerCase()

    // if command doesn't exist exit
    const command = client.commands.get(commandName) || client.commands.find(cmd => !!cmd.aliases?.includes(commandName))
    if (!command) {
      if (message.guild) return
      else return executeRegexCommands(message)
    }

    // guild only
    if (command.guildOnly && channel.type !== 'text') {
      reply(message, 'sorry, I can\u2019t execute that command inside DMs. Noot noot.')
      return
    }

    // if no args
    if (command.args && !args.length) {
      reply(message, `you didn\u2019t provide any arguments. Noot noot.
The syntax is: \`${prefix}${command.name}${command.syntax ? ` ${command.syntax}` : ''}\`. Noot noot.`)
      return
    }

    // cooldowns
    if (!cooldowns.has(command.name)) cooldowns.set(command.name, new Collection())

    const timestamps = cooldowns.get(command.name)!
    const cooldownAmount = command.cooldown ?? 3 * 1000
    if (timestamps.has(author.id)) {
      const expirationTime = timestamps.get(author.id)! + cooldownAmount
      if (now < expirationTime) {
        const timeLeft = ((expirationTime - now) / 1000).toFixed(1)
        reply(message,
          `please wait ${timeLeft} more second${
          timeLeft === '1.0' ? '' : 's'} before using the \`${command.name}\` command. Noot noot.`
        )
        return
      }
    }
    timestamps.set(author.id, now)
    setTimeout(() => timestamps.delete(author.id), cooldownAmount)

    // execute command
    try {
      await command.execute(message, args, prefixes)
    } catch (error) {
      handleError(client, error,
        `Command \`${command.name}\` failed${args.length ? ` with args ${args.map(a => `\`${a}\``).join(', ')}` : ''}.`,
        message
      )
    }
  } else executeRegexCommands(message)
})

// start server and login to Discord
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
