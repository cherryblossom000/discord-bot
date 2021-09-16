import {inlineCode} from '@discordjs/builders'
import {Collection} from 'discord.js'
import {checkPermissions} from '../../utils.js'
import type {AnyContextMenuCommand, RotateAttachment} from '../../types'
import type {ReadonlyNonEmpty} from '../../utils'

const command: AnyContextMenuCommand = {
  name: 'Rotate Image',
  async execute(interaction) {
    if (!(await checkPermissions(interaction, 'ATTACH_FILES'))) return
    const message = interaction.options.getMessage('message', true)
    const attachments =
      message.attachments instanceof Collection
        ? [...message.attachments.values()]
        : message.attachments.map(({filename, url}) => ({name: filename, url}))
    if (!attachments.length) {
      await interaction.reply({
        content: 'That message doesn’t have any attachments! Noot noot.',
        ephemeral: true
      })
      return
    }
    interaction.client.rotateAttachments.set(
      interaction.user.id,
      attachments as unknown as ReadonlyNonEmpty<RotateAttachment>
    )
    await interaction.reply({
      content: `Use ${inlineCode('/rotate')} to rotate the image!`,
      ephemeral: true
    })
  }
}
export default command
