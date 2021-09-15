import {checkPermissions, sendDeletableMessage} from '../utils.js'
import type {GuildOnlyCommand} from '../types'

const command: GuildOnlyCommand = {
  name: 'icon',
  aliases: ['i'],
  description: 'Gets the server icon.',
  guildOnly: true,
  async execute(message) {
    if (!(await checkPermissions(message, 'ATTACH_FILES'))) return
    const icon = message.guild.iconURL()
    await sendDeletableMessage(
      message,
      icon === null
        ? 'This server doesn’t have an icon! Noot noot.'
        : {files: [icon]}
    )
  }
}
export default command
