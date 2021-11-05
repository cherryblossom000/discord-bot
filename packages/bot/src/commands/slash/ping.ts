import {SlashCommandBuilder} from '../../discordjs-builders.js'
import type {AnySlashCommand} from '../../types'

const command: AnySlashCommand = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Gets my current latency.'),
  async execute(interaction) {
    await interaction.reply('Pinging…')
    await interaction.editReply(`Noot noot!
Latency: ${Date.now() - interaction.createdTimestamp} ms
Websocket: ${interaction.client.ws.ping} ms`)
  }
}
export default command
