import {MessageActionRow, MessageButton} from 'discord.js'
import {SlashCommandBuilder} from '@discordjs/builders'
import type {InteractionReplyOptions} from 'discord.js'
import type {AnySlashCommand} from '../../types'

const options: InteractionReplyOptions = {
  content: 'Here’s my website!',
  components: [
    new MessageActionRow({
      components: [
        new MessageButton({
          style: 'LINK',
          label: 'Comrade Pingu Website',
          url: 'https://comrade-pingu--cherryblossom00.repl.co'
        })
      ]
    })
  ]
}

const command: AnySlashCommand = {
  data: new SlashCommandBuilder()
    .setName('website')
    .setDescription('Sends my website.'),
  async execute(interaction) {
    await interaction.reply(options)
  }
}
export default command
