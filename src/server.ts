import {join} from 'path'
import fs from 'fs'
import {promisify} from 'util'
import {Collection} from 'discord.js'
import dotenv from 'dotenv'
import express from 'express'
import {PinguClient} from './types'
import {logDate, reply} from './helpers'
import {me, prefix} from './constants'

import type {AddressInfo} from 'net'
import type {Server} from 'http'
import type {Message, Snowflake} from 'discord.js'
import type {PinguCommand, PinguRegexCommand} from './types'

const readdir = promisify(fs.readdir)

dotenv.config()

// routing
const app = express()

app.get('/', (_, res) => res.send('The bot is online!'))

const listener: Server = app.listen(process.env.PORT, () =>
  console.log(`http://localhost:${(listener.address() as AddressInfo).port}`))

const client = new PinguClient()

const sendMeError = async (error: Error, info: string): Promise<void> => {
  (await client.users.fetch(me)!).send(`${info}
**Error at ${new Date().toLocaleString()}**
${error.stack}`)
}

const handleErrors = (error: Error, message: Message, info: string): void => {
  reply(message, 'unfortunately, there was an error trying to execute that command. Noot noot.')
  process.env.NODE_ENV === 'production' ? sendMeError(error, info) : console.error(error)
}

const importCommands = async <T>(path: string): Promise<T[]> => {
  try {
    const files = await readdir(join(__dirname, path))
    const modules = await Promise.all(files
      .filter(f => !f.endsWith('.map'))
      .map(async f => import(join(__dirname, path, f)))
    )
    return modules.map<T>(m => m.default)
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') sendMeError(error, `\`importCommands\` failed with path \`${path}\`.`)
    throw error
  }
}

// initialise commands
importCommands<PinguCommand>('./commands').then(commands => commands.forEach(c => client.commands.set(c.name, c)))

// initialise cooldowns
const cooldowns = new Collection<string, Collection<Snowflake, number>>()

// ready
client.once('ready', () => {
  client.setActivity()
  console.log(`READY
Users: ${client.users.cache.size}
Channels: ${client.channels.cache.size}
Guilds: ${client.guilds.cache.size}`)
  logDate()
})

// errors
client.on('error', console.error)
client.on('disconnect', () => {
  console.log('DISCONNECTED')
  logDate()
})
client.on('reconnecting', () => {
  client.setActivity()
  console.log('RECONNECTING')
  logDate()
})
client.on('resume', () => {
  client.setActivity()
  console.log('RESUMED')
  logDate()
})

// guild create
client.on('guildCreate', guild => {
  console.log(`GUILD CREATE: ${guild.name} (id: ${guild.id})
Channels: ${guild.channels.cache.size}
Members:${guild.memberCount}`)
  client.setActivity()
})

// guild delete
client.on('guildDelete', guild => {
  console.log(`GUILD DELETE: ${guild.name} (id: ${guild.id})`)
  client.setActivity()
})

// commands
client.on('message', (message: Message) => {
  const now = Date.now()
  const {author, content, channel} = message

  if (author?.bot) return

  if (content.startsWith(prefix)) {
    // exits if there is no input
    const input = content.slice(prefix.length).trim()
    if (!input.length) return

    // get args
    const args = input.split(/\s+/)
    const commandName = args.shift()!.toLowerCase()

    // if command doesn't exist exit
    const command = client.commands.get(commandName) || client.commands.find(cmd => !!cmd.aliases?.includes(commandName))
    if (!command) return

    // guild only
    if (command.guildOnly && channel.type !== 'text')
      return reply(message, 'sorry, I can\u{2019}t execute that command inside DMs. Noot noot.')

    // if no args
    if (command.args && !args.length) {
      return reply(message, `you didn\u{2019}t provide any arguments. Noot noot.
The syntax is: \`${prefix}${command.name}${command.syntax ? ` ${command.syntax}` : ''}\`. Noot noot.`)
    }

    // cooldowns
    if (!cooldowns.has(command.name)) cooldowns.set(command.name, new Collection())

    const timestamps = cooldowns.get(command.name)!
    const cooldownAmount = command.cooldown ?? 3 * 1000
    if (timestamps.has(author.id)) {
      const expirationTime = timestamps.get(author.id)! + cooldownAmount
      if (now < expirationTime) {
        const timeLeft = ((expirationTime - now) / 1000).toFixed(1)
        return reply(message,
          `please wait ${timeLeft} more second${timeLeft === '1.0' ? '' : 's'} before using the \`${command.name}\` ` +
          'command. Noot noot.'
        )
      }
    }
    timestamps.set(author.id, now)
    setTimeout(() => timestamps.delete(author.id), cooldownAmount)

    // execute command
    try {
      command.execute(message, args)
    } catch (error) {
      handleErrors(error, message,
        `Command \`${command.name}\` failed${args.length ? ` with args ${args.map(a => `\`${a}\``).join(', ')}` : ''}.`
      )
    }
  } else {
    // regex message commands
    importCommands<PinguRegexCommand>('./regex_commands').then(commands => commands.forEach(command => {
      try {
        if (command.regex) {
          if (command.regex.test(content))
            command.regexMessage ? channel.send(command.regexMessage) : command.execute!(message)
        } else command.execute!(message)
      } catch (error) {
        handleErrors(error, message, `Regex command with regex \`${command.regex}\` failed.`)
      }
    }))
  }
})

// login to Discord
client.login(process.env.TOKEN)
