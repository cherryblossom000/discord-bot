import {SlashCommandBuilder} from '@discordjs/builders'
import {setValue} from '../../database.js'
import {checkPermissions} from '../../utils.js'
import type {GuildOnlySlashCommand} from '../../types'

const ENABLE = 'enable'
const DISABLE = 'disable'

const command: GuildOnlySlashCommand = {
  data: new SlashCommandBuilder()
    .setName('pin')
    .setDescription('Manage settings for the ‘Pin Message’ command.')
    .setDMPermission(false)
    .setDefaultMemberPermissions(0)
    .addSubcommand(subcommand =>
      subcommand
        .setName(ENABLE)
        .setDescription('Enable allowing anyone to pin a message.')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName(DISABLE)
        .setDescription('Disable allowing anyone to pin a message.')
    ),
  async execute(interaction, database) {
    const subCommand = interaction.options.getSubcommand()
    const isEnable = subCommand === ENABLE
    if (isEnable && !(await checkPermissions(interaction, 'MANAGE_MESSAGES')))
      return
    await setValue(
      database,
      'guilds',
      interaction.guildId,
      'enablePinning',
      isEnable
    )
    await interaction.reply(
      `Successfully ${isEnable ? 'enabled' : 'disabled'}! Noot noot.`
    )
  }
}
export default command
