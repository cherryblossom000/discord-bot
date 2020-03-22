import {join} from 'path'
import {promises} from 'fs'
import {Collection} from 'discord.js'
import express from 'express'
import {PinguClient} from './types'
import {createResolve, handleError, reply, sendMeError} from './helpers'
import {prefix} from './constants'

import type {AddressInfo} from 'net'
import type {Server} from 'http'
import type {Snowflake} from 'discord.js'
import type {Command, PinguMessage, RegexCommand} from './types'

const {readdir} = promises
const resolve = createResolve(__dirname)

// routing
const app = express()

app.get('/', (_, res) => res.sendFile(resolve('../assets/html/index.html')))
app.get('/license', (_, res) => res.sendFile(resolve('../assets/html/license.html')))
app.get('/changelog', (_, res) => res.sendFile(resolve('../assets/html/changelog.html')))
app.use(express.static(resolve('../assets/css')))
app.use(express.static(resolve('../assets/img')))

const client = new PinguClient()

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
client.on('message', (message: PinguMessage) => {
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
    if (command.guildOnly && channel.type !== 'text') {
      reply(message, 'sorry, I can\u{2019}t execute that command inside DMs. Noot noot.')
      return
    }

    // if no args
    if (command.args && !args.length) {
      reply(message, `you didn\u{2019}t provide any arguments. Noot noot.
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
      command.execute(message, args)
    } catch (error) {
      handleError(client, error, message,
        `Command \`${command.name}\` failed${args.length ? ` with args ${args.map(a => `\`${a}\``).join(', ')}` : ''}.`
      )
    }
  } else {
    // regex message commands
    client.regexCommands.forEach((regexMessage, regex) => {
      if (regex.test(content)) {
        typeof regexMessage === 'string'
          ? channel.send(regexMessage)
          : channel.send(regexMessage(message))
      }
    })
  }
})

// start server and login to Discord
;(async (): Promise<void> => {
  if (process.env.NODE_ENV !== 'production') {
    const dotenv = await import('dotenv')
    dotenv.config()
  }
  const listener: Server = app.listen(process.env.PORT, () => {
    if (process.env.NODE_ENV !== 'production') console.log(`http://localhost:${(listener.address() as AddressInfo).port}`)
  })
  client.login(process.env.TOKEN)
})()
