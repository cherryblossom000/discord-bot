import {inlineCode} from '../discordjs-builders.js'
import {debugInteractionDetails, handleError} from '../utils.js'
import type {EventListener} from '../Client'
import type {AnySlashCommand} from '../types'

const listener: EventListener<'interactionCreate'> =
  (client, database) =>
  async (interaction): Promise<void> => {
    if (interaction.isCommand()) {
      const {commandName} = interaction
      const command = client.slashCommands.get(commandName)
      if (!command) {
        handleError(client, new Error(`Command ${commandName} not found`))
        return
      }
      if ((command.guildOnly ?? false) && !interaction.inGuild()) {
        await interaction.reply({
          content: 'This command is only available in servers! Noot noot.',
          ephemeral: true
        })
        return
      }
      try {
        await (command as AnySlashCommand).execute(interaction, database)
      } catch (error) {
        handleError(
          client,
          error,
          `Command ${inlineCode(commandName)} failed
${debugInteractionDetails(interaction)}`,
          {to: interaction}
        )
      }
    } else if (interaction.isContextMenu()) {
      const {commandName, targetType} = interaction
      const command = (
        targetType === 'USER' ? client.userCommands : client.messageCommands
      ).get(commandName)
      if (!command) {
        handleError(client, new Error(`Command ${commandName} not found`))
        return
      }
      try {
        await command.execute(interaction, database)
      } catch (error) {
        handleError(
          client,
          error,
          `Command ${inlineCode(commandName)} failed
${debugInteractionDetails(interaction)}`,
          {to: interaction}
        )
      }
    }
  }
export default listener
