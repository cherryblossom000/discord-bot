import {SlashCommandBuilder, hyperlink} from '@discordjs/builders'
import {checkPermissions} from '../../utils.js'
import type {AnySlashCommand} from '../../types'

const IWMELC = 'I will murder every last capitalist'
const HTKB = 'how to kiss boy'

const imagesFolder = new URL('../../../assets/img/', import.meta.url)
const htkb = new URL('htkb.jpg', imagesFolder).pathname
const iwmelc = new URL('iwmelc.jpg', imagesFolder).pathname

const MEME = 'meme'

const command: AnySlashCommand = {
  data: new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Gets a Pingu-related meme.')
    .addStringOption(option =>
      option
        .setName(MEME)
        .setDescription('The meme to get.')
        .setRequired(true)
        .addChoices([
          [IWMELC, iwmelc],
          [HTKB, htkb]
        ])
    ),
  usage: `!${hyperlink(
    IWMELC,
    './assets/img/iwmelc.jpg'
  )}<br><img src="./assets/img/htkb.jpg" alt="${HTKB}" width="320">`,
  async execute(interaction) {
    if (!(await checkPermissions(interaction, 'ATTACH_FILES'))) return
    await interaction.reply({
      files: [interaction.options.getString(MEME, true)]
    })
  }
}
export default command
