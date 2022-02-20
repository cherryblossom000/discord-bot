// TODO: config allowed channels

import {hyperlink} from '@discordjs/builders'
import {fetchValue} from '../../database.js'
import {checkPermissions} from '../../utils.js'
import type {Snowflake} from 'discord.js'
import type {GuildOnlyMessageContextMenuCommand} from '../../types'

const command: GuildOnlyMessageContextMenuCommand = {
  name: 'Pin Message',
  guildOnly: true,
  async execute(interaction, database) {
    if (
      !(
        (await fetchValue(
          database,
          'guilds',
          interaction.guildId,
          'enablePinning'
        )) ?? false
      )
    ) {
      await interaction.reply({
        content: 'You can’t pin messages here! Noot noot.'
      })
      return
    }
    if (!(await checkPermissions(interaction, 'MANAGE_MESSAGES'))) return
    const {channelId, client, guildId, options, user} = interaction
    const messageId = options.getMessage('message', true).id
    await (
      client['api'] as {
        channels: (channelId: Snowflake) => {
          pins: (messageId: Snowflake) => {
            put: (options: {reason: string}) => Promise<unknown>
          }
        }
      }
    )
      .channels(channelId)
      .pins(messageId)
      .put({reason: `‘Pin Message’ from ${user.tag} (${user.id})`})
    await interaction.reply(
      `Pinned ${hyperlink(
        `message ${messageId}`,
        `https://discord.com/channels/${guildId}/${channelId}/${messageId}`
      )}. Noot noot.`
    )
  }
}
export default command
