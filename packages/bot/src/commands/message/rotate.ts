import {ContextMenuCommandBuilder} from '@discordjs/builders'
import {
	Collection,
	MessageActionRow,
	MessageButton,
	type InteractionReplyOptions,
	type MessageEmbedOptions
} from 'discord.js'
import sharp from 'sharp'
import {emojis, timeout} from '../../constants.js'
import {
	BACK,
	ReplyMode,
	backButton,
	backButtonDisabled,
	checkPermissions,
	deleteMessage,
	fetchChannel,
	forwardButton,
	forwardButtonDisabled,
	replyAndFetch,
	request,
	timeoutFollowUp
} from '../../utils.js'
import type {APIAttachment} from 'discord-api-types/v9'
import type {AnyMessageContextMenuCommand} from '../../types'

const TICK = 'tick'
const tickButton = new MessageButton({
	style: 'SUCCESS',
	label: 'Select',
	customId: TICK
})

const CANCEL = 'cancel'
const cancelButton = new MessageButton({
	style: 'DANGER',
	label: 'Cancel',
	customId: CANCEL
})

const ANTICLOCKWISE = 'anticlockwise'
const anticlockwiseButton = new MessageButton({
	style: 'SECONDARY',
	label: '-90°',
	emoji: emojis.anticlockwise,
	customId: ANTICLOCKWISE
})

const CLOCKWISE = 'clockwise'
const clockwiseButton = new MessageButton({
	style: 'SECONDARY',
	label: '90°',
	emoji: emojis.clockwise,
	customId: CLOCKWISE
})

const UPSIDE_DOWN = 'upsideDown'
const upsideDownButton = new MessageButton({
	style: 'SECONDARY',
	label: '180°',
	customId: UPSIDE_DOWN
})

const CUSTOM = 'custom'
const customButton = new MessageButton({
	style: 'SECONDARY',
	label: 'Custom',
	customId: CUSTOM
})

type Attachment = Readonly<
	Pick<APIAttachment, 'description' | 'filename' | 'url'>
>

const attachmentEmbedOptions = (
	attachment: Attachment
): MessageEmbedOptions => ({
	fields: [
		{name: 'Name', value: attachment.filename},
		...(attachment.description === undefined
			? []
			: [{name: 'Description', value: attachment.description}])
	],
	image: {url: attachment.url}
})

const command: AnyMessageContextMenuCommand = {
	data: new ContextMenuCommandBuilder().setName('Rotate Image'),
	async execute(interaction) {
		if (!(await checkPermissions(interaction, 'ATTACH_FILES'))) return

		const {channelId, client, options, user} = interaction
		const message = options.getMessage('message', true)

		const attachments =
			message.attachments instanceof Collection
				? message.attachments.map(
						({url, name, description}): Attachment => ({
							url,
							filename: name!,
							description: description ?? undefined
						})
				  )
				: message.attachments
		if (!attachments.length) {
			await interaction.reply({
				content: 'That message doesn’t have any attachments! Noot noot.',
				ephemeral: true
			})
			return
		}

		// Select attachment

		const messageOptions = (
			index: number
		): Pick<InteractionReplyOptions, 'components' | 'embeds'> => ({
			embeds: [
				{
					title: 'Which image would you like to rotate?',
					...attachmentEmbedOptions(attachments[index]!),
					footer: {text: `Attachment ${index + 1} of ${attachments.length}`}
				}
			],
			components: [
				new MessageActionRow({
					components: [
						tickButton,
						index ? backButton : backButtonDisabled,
						index < attachments.length - 1
							? forwardButton
							: forwardButtonDisabled,
						cancelButton
					]
				})
			]
		})

		const selectAttachment = async (): Promise<Attachment | undefined> => {
			const embedMessage = await replyAndFetch(interaction, messageOptions(0))
			const collector = embedMessage.createMessageComponentCollector({
				time: timeout
			})

			let currentIndex = 0
			const collected = await new Promise<Attachment | string | undefined>(
				(resolve, reject) => {
					collector
						.on('collect', buttonInteraction => {
							if (buttonInteraction.user.id !== user.id) {
								buttonInteraction
									.reply({
										content: `Only ${user} can do this! Noot noot.`,
										ephemeral: true
									})
									.catch(reject)
								return
							}

							if (buttonInteraction.customId === TICK) {
								resolve(attachments[currentIndex])
								collector.stop()
								return
							}

							if (buttonInteraction.customId === CANCEL) {
								resolve(undefined)
								collector.stop()
								return
							}

							buttonInteraction.customId === BACK
								? currentIndex--
								: currentIndex++
							buttonInteraction
								.update(messageOptions(currentIndex))
								.catch(reject)
						})
						.on('end', (_, reason) => {
							resolve(reason)
						})
				}
			)

			if (typeof collected != 'object') {
				if (collected === 'time') await timeoutFollowUp(interaction)
				// otherwise cancelled or message/channel/guild delete etc
				await embedMessage.delete()
				return
			}
			return collected
		}

		const singleAttachment = attachments.length === 1
		const attachment = singleAttachment
			? attachments[0]!
			: await selectAttachment()
		if (!attachment) return

		// Choose angle

		const getAngle = async (): Promise<number | undefined> => {
			const reply = await replyAndFetch(
				interaction,

				{
					embeds: [
						{
							title: 'Choose an angle',
							description:
								'Positive values are clockwise and negative values are anticlockwise.',
							...attachmentEmbedOptions(attachment)
						}
					],
					components: [
						new MessageActionRow({
							components: [
								anticlockwiseButton,
								upsideDownButton,
								clockwiseButton,
								customButton,
								cancelButton
							]
						})
					]
				},
				singleAttachment ? ReplyMode.REPLY : ReplyMode.EDIT_REPLY
			)
			switch (
				(
					await reply.awaitMessageComponent({
						componentType: 'BUTTON'
					})
				).customId
			) {
				case ANTICLOCKWISE:
					return -90
				case UPSIDE_DOWN:
					return 180
				case CLOCKWISE:
					return 90
				case CUSTOM: {
					const [, channel] = await Promise.all([
						interaction.editReply('Enter an angle (in degrees):'),
						fetchChannel(interaction)
					])
					const customAngle = await new Promise<number | undefined>(
						(resolve, reject) => {
							const collector = channel
								.createMessageCollector({
									filter: ({author}) => author.id === user.id,
									time: timeout
								})
								.on('collect', msg => {
									const rawAngle = Number(msg.content)
									if (Number.isNaN(rawAngle)) {
										interaction
											.followUp({
												content: `${rawAngle} isn’t a number!`,
												ephemeral: true
											})
											.catch(reject)
									} else {
										resolve(rawAngle)
										collector.stop()
									}
								})
								.on('end', (_, reason) => {
									if (reason === 'time') resolve(undefined)
								})
						}
					)
					if (customAngle === undefined) {
						await Promise.all([
							timeoutFollowUp(interaction),
							channel.messages.delete(reply.id)
						])
						return
					}
					return customAngle
				}
				default:
					// CANCEL
					await deleteMessage(client, channelId, reply.id)
			}
		}
		const angle = await getAngle()
		if (angle === undefined) return

		// Rotate

		await interaction.editReply({
			files: [
				{
					attachment: (await request('Fetching image', attachment.url))
						.pipe(sharp())
						.rotate(angle),
					name: attachment.filename,
					description: attachment.description
				}
			],
			content: null,
			embeds: [],
			components: []
		})
	}
}
export default command
