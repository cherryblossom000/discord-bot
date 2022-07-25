import {
	GuildDefaultMessageNotifications,
	GuildPremiumTier,
	GuildVerificationLevel,
	SlashCommandBuilder,
	channelMention,
	type APIEmbedField,
	type SystemChannelFlagsResolvable,
	type VoiceChannel
} from 'discord.js'
import {fetchTimeZone} from '../../database.js'
import {
	checkPermissions,
	createDateFormatter,
	fetchGuild,
	formatBoolean,
	inlineField as f,
	imageField,
	pascalToStartCase,
	screamingSnakeToStartCase
} from '../../utils.js'
import type {GuildOnlySlashCommand} from '../../types'

const allSystemChannelSuppressFlags: SystemChannelFlagsResolvable = [
	'SuppressJoinNotifications',
	'SuppressPremiumSubscriptions',
	'SuppressGuildReminderNotifications',
	'SuppressJoinNotificationReplies'
]

const channelFieldData = (
	fieldName: string,
	channelId: string | null,
	getSuffix = (): string => ''
): readonly APIEmbedField[] =>
	channelId === null
		? []
		: [f(fieldName, channelMention(channelId) + getSuffix())]

const command: GuildOnlySlashCommand = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Gets information on this server.')
		.setDMPermission(false),
	// eslint-disable-next-line complexity -- todo
	async execute(interaction, database) {
		const {client, user} = interaction
		if (!(await checkPermissions(interaction, ['EmbedLinks']))) return
		const guild = await fetchGuild(interaction)
		const {
			afkChannelId,
			afkTimeout,
			applicationId,
			createdAt,
			defaultMessageNotifications,
			description,
			discoverySplash,
			features,
			id,
			memberCount,
			members,
			mfaLevel,
			name,
			ownerId,
			partnered,
			publicUpdatesChannelId,
			preferredLocale,
			premiumSubscriptionCount,
			premiumTier,
			rulesChannelId,
			systemChannelFlags,
			systemChannelId,
			vanityURLCode,
			vanityURLUses,
			verificationLevel,
			widgetChannelId,
			widgetEnabled
		} = guild
		const formatDate = createDateFormatter(
			await fetchTimeZone(database, user.id)
		)

		const icon = guild.iconURL()
		const banner = guild.bannerURL()
		const afkTimeoutText = (): string => {
			let text: string
			if (afkTimeout === 3600) text = '1 hour'
			else {
				const minutes = afkTimeout / 60
				text = `${minutes} minute${minutes === 1 ? '' : 's'}`
			}
			return ` (timeout: ${text})`
		}
		await interaction.reply({
			embeds: [
				{
					title: name,
					thumbnail: icon === null ? undefined : {url: icon},
					image: banner === null ? undefined : {url: banner},
					fields: [
						f('Id', id),
						...(description === null ? [] : [f('Description', description)]),
						f('Created At', formatDate(createdAt)),
						f('Owner', `${await members.fetch(ownerId)}`),
						...(applicationId === null
							? []
							: [f('Application Id', applicationId)]),
						...(icon === null ? [] : [imageField('Icon', icon)]),
						...(banner === null ? [] : [imageField('Banner', banner)]),
						...(discoverySplash === null
							? []
							: [imageField('Discovery Splash', guild.discoverySplashURL()!)]),
						f('Members', String(memberCount)),
						f('Preferred Locale', preferredLocale),
						...(features.length
							? [
									f(
										'Features',
										features
											.map(feature =>
												feature === 'VIP_REGIONS'
													? 'VIP Regions'
													: screamingSnakeToStartCase(feature)
											)
											.join('\n')
									)
							  ]
							: []),
						...(vanityURLCode === null
							? []
							: [
									f(
										'Vanity URL',
										`https://discord.gg/${vanityURLCode} (${
											vanityURLUses ?? 0
										}) uses`
									)
							  ]),
						...(afkChannelId === null
							? []
							: [
									await client.channels
										.fetch(afkChannelId)
										.then(afkChannel =>
											f(
												'AFK Channel',

												(afkChannel as VoiceChannel).name + afkTimeoutText()
											)
										)
										.catch(() =>
											f('AFK Channel Id', afkChannelId + afkTimeoutText())
										)
							  ]),
						...(systemChannelFlags.has(allSystemChannelSuppressFlags)
							? []
							: channelFieldData(
									'System Messages Channel',
									systemChannelId,
									() =>
										` (${systemChannelFlags
											.missing(allSystemChannelSuppressFlags)
											.map(string => pascalToStartCase(string.slice(8))) // 'Suppress'.length === 8
											.join(', ')})`
							  )),
						...(widgetEnabled ?? false
							? channelFieldData('Widget Channel', widgetChannelId)
							: []),
						...channelFieldData(
							'Community Updates Channel',
							publicUpdatesChannelId
						),
						...channelFieldData('Rules Channel', rulesChannelId),
						...(premiumSubscriptionCount ?? 0
							? [
									f(
										'Sever Boost Status',
										`${
											premiumTier === GuildPremiumTier.None
												? 'No Server Boost'
												: `Level ${premiumTier}`
										} (${premiumSubscriptionCount} boosts)`
									)
							  ]
							: []),
						f(
							'Default Notifications',

							defaultMessageNotifications ===
								GuildDefaultMessageNotifications.AllMessages
								? 'All Messages'
								: 'Only @mentions'
						),
						f(
							'Verification Level',

							verificationLevel === GuildVerificationLevel.VeryHigh
								? 'Highest'
								: GuildVerificationLevel[verificationLevel]!
						),
						f('Requires 2FA for moderation', formatBoolean(!!mfaLevel)),
						f('Partnered', formatBoolean(partnered))
					]
				}
			]
		})
	}
}
export default command
