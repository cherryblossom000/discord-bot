import {SlashCommandBuilder} from '../../discordjs-builders.js'
import ms from 'ms'
import type {AnySlashCommand} from '../../types'

const command: AnySlashCommand = {
  data: new SlashCommandBuilder()
    .setName('uptime')
    .setDescription('Gets my uptime.'),
  async execute(interaction) {
    await interaction.reply(`Uptime: ${ms(interaction.client.uptime!)}`)
  }
}
export default command
