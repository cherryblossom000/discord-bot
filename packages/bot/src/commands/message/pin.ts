// TODO: config allowed channels

import {hyperlink} from '@discordjs/builders'
import {MessageFlags, InteractionResponseType} from 'discord-api-types/v9'
import {fetchValue} from '../../database.js'
import {checkPermissions} from '../../utils.js'
import type {RESTPostAPIInteractionCallbackJSONBody} from 'discord-api-types/v9'
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
        content: 'You can’t pin messages here! Noot noot.',
        ephemeral: true
      })
      return
    }
    if (!(await checkPermissions(interaction, 'MANAGE_MESSAGES'))) return
    const {channelId, client, guildId, id, options, token, user} = interaction
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
    // TODO: use Discord.js API once https://github.com/discordjs/discord.js/pull/7312 is released
    await (
      client['api'] as {
        interactions: (
          interactionId: Snowflake,
          interactionToken: string
        ) => {
          callback: {
            post: (options: {
              data: RESTPostAPIInteractionCallbackJSONBody
            }) => Promise<unknown>
          }
        }
      }
    )
      .interactions(id, token)
      .callback.post({
        data: {
          type: InteractionResponseType.ChannelMessageWithSource,
          data: {
            content: `Pinned ${hyperlink(
              `message ${messageId}`,
              `https://discord.com/channels/${guildId}/${channelId}/${messageId}`
            )}. Noot noot.`,
            flags: MessageFlags.SuppressEmbeds
          }
        }
      })
    // eslint-disable-next-line require-atomic-updates -- not a race condition
    interaction.replied = true
  }
}
export default command
