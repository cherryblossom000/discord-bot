import {
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	OAuth2Scopes,
	SlashCommandBuilder,
	type InteractionReplyOptions
} from 'discord.js'
import {permissions} from '../../constants.js'
import type {AnySlashCommand} from '../../types'

let options: InteractionReplyOptions

const command: AnySlashCommand = {
	data: new SlashCommandBuilder()
		.setName('invite')
		.setDescription('Gets my invite link.'),
	async execute(interaction) {
		await interaction.reply(
			(options ??= {
				content: 'Invite me using this link!',
				components: [
					{
						type: ComponentType.ActionRow,
						components: [
							new ButtonBuilder({
								style: ButtonStyle.Link,
								label: 'Invite link',
								url: interaction.client.generateInvite({
									scopes: [OAuth2Scopes.ApplicationsCommands, OAuth2Scopes.Bot],
									permissions
								})
							})
						]
					}
				]
			})
		)
	}
}
export default command
