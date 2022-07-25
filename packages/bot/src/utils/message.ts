import type {InteractionReplyOptions, MessagePayload} from 'discord.js'
import type {CommandInteraction} from '../types'

export const replyDeletable = async (
	interaction: CommandInteraction,
	content: InteractionReplyOptions | MessagePayload | string,
	followUp = false
): Promise<void> => {
	await (followUp ? interaction.followUp(content) : interaction.reply(content))
	// TODO: enable deleting via context menus?
}
