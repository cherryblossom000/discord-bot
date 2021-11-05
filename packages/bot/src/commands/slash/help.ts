import {SlashCommandBuilder, inlineCode} from '../../discordjs-builders.js'
import {ApplicationCommandOptionType} from 'discord-api-types/v9'
import {
  commandFiles,
  formatCommandSyntax,
  formatCommandUsage,
  removeJSExtension
} from '../../utils.js'
import type {EmbedFieldData} from 'discord.js'
import type {
  APIApplicationCommandOption,
  APIApplicationCommandSubCommandOptions,
  RESTPostAPIChatInputApplicationCommandsJSONBody
} from 'discord-api-types/v9'
import type {AnySlashCommand} from '../../types'
import type {FormatCommandSyntaxInput} from '../../utils'

const HELP = 'help'
const COMMAND = 'command'

const optionFields = (command: {
  options?: readonly APIApplicationCommandOption[]
}): EmbedFieldData[] | undefined =>
  command.options?.map(opt => ({
    name: opt.name,
    value: opt.description
  }))

let allCommands: string | undefined

const command: AnySlashCommand = {
  data: new SlashCommandBuilder()
    .setName(HELP)
    .setDescription(
      'Lists all my commands or gets info about a specific command.'
    )
    .addStringOption(option =>
      option
        .setName(COMMAND)
        .setDescription(
          'The command that you want to get info about. If omitted, all the commands will be listed.'
        )
        .addChoices(
          commandFiles.flatMap(filename => {
            const name = removeJSExtension(filename)
            return name === HELP ? [] : [[name, name]]
          })
        )
    ),
  async execute(interaction) {
    const {
      client: {slashCommands}
    } = interaction

    const commandName = interaction.options.getString(COMMAND)

    // All commands
    if (commandName === null) {
      await interaction.reply({
        content: (allCommands ??= `Here’s a list of all my commands:
${slashCommands
  .filter(({hidden = false}) => !hidden)
  .sorted(({data: a}, {data: b}) => a.name.localeCompare(b.name))
  .map(({data: {name, description}}) => `\`${name}\`: ${description}`)
  .join('\n')}
You can send ${inlineCode(
          '/help [command name]'
        )} to get info on a specific command. Noot noot.`),
        ephemeral: true
      })
      return
    }

    // Specific command
    const {data, usage} = slashCommands.get(commandName)!
    // TODO: fix @discordjs/builders types
    const cmd = data.toJSON() as RESTPostAPIChatInputApplicationCommandsJSONBody
    const {name, description, options} = cmd
    const hasSubcommands =
      options?.[0]?.type === ApplicationCommandOptionType.Subcommand
    await interaction.reply({
      embeds: [
        {
          title: name,
          description: hasSubcommands
            ? description + (usage === undefined ? '' : `\n${usage}`)
            : formatCommandSyntax(cmd as FormatCommandSyntaxInput, {
                includeDescription: true
              }) + formatCommandUsage(usage),
          fields: hasSubcommands ? undefined : optionFields(cmd)
        },
        ...(hasSubcommands
          ? // For now I don't use any subcommand groups, so this is fine
            (options as APIApplicationCommandSubCommandOptions[]).map(c => ({
              title: `${name} ${c.name}`,
              description:
                formatCommandSyntax(c as FormatCommandSyntaxInput, {
                  prefix: name,
                  includeDescription: true
                }) + formatCommandUsage(usage),
              fields: optionFields(c)
            }))
          : [])
      ],
      ephemeral: true
    })
  }
}
export default command
