import {inlineCode} from '@discordjs/builders'
import {debugInteractionDetails, handleError} from '../utils.js'
import type {Collection} from 'discord.js'
import type {Client, EventListener} from '../Client'
import type {AnySlashCommand, Command, CommandInteraction} from '../types'
import type {CollectionValue, KeysMatching} from '../utils'

const handleInteractionError =
  (interaction: CommandInteraction) =>
  (error: unknown): void =>
    handleError(
      interaction.client,
      error,
      `Command ${inlineCode(interaction.commandName)} failed
${debugInteractionDetails(interaction)}`,
      {to: interaction}
    )

const listener: EventListener<'interactionCreate'> = (client, database) => {
  const getCommand = <
    K extends KeysMatching<Client, Collection<string, Command>>
  >(
    interaction: CommandInteraction,
    key: K
  ): CollectionValue<Client[K]> | undefined => {
    const {commandName} = interaction
    const command = (
      client[key] as Collection<string, CollectionValue<Client[K]>>
    ).get(commandName)
    if (!command)
      handleError(client, new Error(`Command ${commandName} not found`))
    return command
  }

  return async (interaction): Promise<void> => {
    if (interaction.isCommand()) {
      const command = getCommand(interaction, 'slashCommands')
      if (!command) return
      if ((command.guildOnly ?? false) && !interaction.inGuild()) {
        await interaction.reply({
          content: 'This command is only available in servers! Noot noot.',
          ephemeral: true
        })
        return
      }
      await (command as AnySlashCommand)
        .execute(interaction, database)
        .catch(handleInteractionError(interaction))
    } else if (interaction.isMessageContextMenu()) {
      const command = getCommand(interaction, 'messageCommands')
      if (command) {
        await command
          .execute(interaction, database)
          .catch(handleInteractionError(interaction))
      }
    } else if (interaction.isUserContextMenu()) {
      const command = getCommand(interaction, 'userCommands')
      if (command) {
        await command
          .execute(interaction, database)
          .catch(handleInteractionError(interaction))
      }
    }
  }
}
export default listener
