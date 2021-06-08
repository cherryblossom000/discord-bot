import {Collection} from 'discord.js'
import escapeRegex from 'escape-string-regexp'
import {dev} from '../constants'
import {fetchPrefix} from '../database'
import {handleError, ignoreError} from '../utils'
import type {Snowflake} from 'discord.js'
import type {EventListener} from '../Client'
import type {Command, GuildMessage, Message} from '../types'

const executeRegexCommands = async (message: Message): Promise<void> => {
  const {client, channel, content} = message
  // Regex message commands
  for (const [regex, regexMessage] of client.regexCommands.entries()) {
    if (regex.test(content)) {
      try {
        // only want to be sent once!
        // eslint-disable-next-line no-await-in-loop -- only single await due to return
        await (typeof regexMessage === 'string'
          ? channel.send(regexMessage)
          : channel.send(regexMessage(message)))
        return
      } catch (error: unknown) {
        handleError(
          client,
          error,
          `Regex command with regex \`${regex}\` failed with message content \`${content}\`.`,
          message
        )
      }
    }
  }
}

const cooldowns = new Collection<string, Collection<Snowflake, number>>()

const listener: EventListener<'message'> =
  (client, database) =>
  // eslint-disable-next-line max-statements -- don't know how to shorten and isn't a typical, simple function
  async (message): Promise<void> => {
    const now = Date.now()
    const {author, content, channel, guild} = message

    if (author.bot) return

    const prefix = await fetchPrefix(database, guild)
    const matchedPrefix = new RegExp(
      `^(<@!?${client.user!.id}>|${escapeRegex(prefix)})`,
      'u'
    ).exec(content)?.[0]
    if (matchedPrefix !== undefined || !guild) {
      const input = content.slice(matchedPrefix?.length ?? 0).trim()

      // Exits if there is no input and the bot was mentioned
      if (!input.length && matchedPrefix !== prefix) {
        await channel.send(`Hi, I am Comrade Pingu. Noot noot.
My prefix is \`${prefix}\`. Run \`${prefix}help\` for a list of commands.`)
        return
      }

      // Get args and command
      const args = input.split(/\s+/u)
      const commandName = args.shift()!.toLowerCase()

      const checkCommand = async (command?: Command): Promise<boolean> => {
        // If command doesn't exist exit or execute regex commands
        if (!command) {
          if (!guild) await executeRegexCommands(message)
          return false
        }

        const {name, args: noArgs = 0, syntax, guildOnly = false} = command
        // Guild only
        if (guildOnly && channel.type !== 'text') {
          await message.sendDeletableMessage({
            reply: true,
            content:
              'sorry, I can’t execute that command inside DMs. Noot noot.'
          })
          return false
        }

        // If no args
        if (args.length < noArgs) {
          await message.sendDeletableMessage({
            reply: true,
            content: `you didn’t provide enough arguments.
The syntax is: \`${prefix}${name}${
              syntax === undefined ? '' : ` ${syntax}`
            }\`. Noot noot.`
          })
          return false
        }
        return true
      }
      const command =
        client.commands.get(commandName) ??
        client.commands.find(({aliases = []}) => aliases.includes(commandName))
      if (!(await checkCommand(command))) return

      if (!dev) {
        const checkCooldowns = async (): Promise<boolean> => {
          if (!cooldowns.has(command!.name))
            cooldowns.set(command!.name, new Collection())

          const timestamps = cooldowns.get(command!.name)!
          const cooldownAmount = (command!.cooldown ?? 3) * 1000
          if (timestamps.has(author.id)) {
            const expirationTime = timestamps.get(author.id)! + cooldownAmount
            if (now < expirationTime) {
              const timeLeft = ((expirationTime - now) / 1000).toFixed(1)
              const msg = await message.reply(
                `please wait ${timeLeft} more second${
                  timeLeft === '1.0' ? '' : 's'
                } before using the \`${command!.name}\` command. Noot noot.`
              )
              // Can't use delete with timeout because I need to return false before waiting 10 seconds
              client.setTimeout(async () => {
                await msg.delete()
                await message.delete().catch(ignoreError('MISSING_PERMISSIONS'))
              }, 5000)
              return false
            }
          }
          timestamps.set(author.id, now)
          client.setTimeout(() => timestamps.delete(author.id), cooldownAmount)
          return true
        }
        if (!(await checkCooldowns())) return
      }

      // Execute command
      const _input = input.replace(new RegExp(`^${commandName}\\s*`, 'u'), '')
      try {
        await command!.execute(
          message as GuildMessage,
          {args, input: _input},
          database
        )
      } catch (error: unknown) {
        handleError(
          client,
          error,
          `Command \`${command!.name}\` failed${
            _input ? ` with input ${_input}` : ''
          }.`,
          message
        )
      }
    } else await executeRegexCommands(message)
  }
export default listener
