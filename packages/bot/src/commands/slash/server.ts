import {
	GuildDefaultMessageNotifications,
	GuildPremiumTier,
	GuildVerificationLevel,
	SlashCommandBuilder,
	type APIEmbedField,
	type GuildBasedChannel,
	type VoiceChannel
} from 'discord.js'
import {fetchTimeZone} from '../../database.js'
import {
	checkPermissions,
	createDateFormatter,
	fetchGuild,
	formatBoolean,
	imageField,
	pascalToStartCase,
	screamingSnakeToStartCase
} from '../../utils.js'
import type {GuildOnlySlashCommand} from '../../types'

const command: GuildOnlySlashCommand = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Gets information on this server.')
		.setDMPermission(false),
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
		const channelFieldData = async (
			fieldName: string,
			channelId: string | null,
			getSuffix = (): string => '',
			// TODO: investigate this
			// maybe the TextBasedChannel mixin is interfering?
			// eslint-disable-next-line @typescript-eslint/no-base-to-string -- false positive
			value = (channel: GuildBasedChannel): string => `${channel}`
		): Promise<readonly APIEmbedField[]> => {
			if (channelId === null) return []
			const suffix = getSuffix()
			const channel = (await client.channels
				.fetch(channelId)
				// eslint-disable-next-line unicorn/no-useless-undefined -- undefined not void
				.catch(() => undefined)) as GuildBasedChannel | null | undefined
			return [
				channel
					? {
							name: fieldName,
							value: value(channel) + suffix
					  }
					: {
							name: `${fieldName} Id`,
							value: channelId + suffix
					  }
			]
		}

		const icon = guild.iconURL()
		const banner = guild.bannerURL()
		await interaction.reply({
			embeds: [
				{
					title: name,
					thumbnail: icon === null ? undefined : {url: icon},
					image: banner === null ? undefined : {url: banner},
					fields: [
						{name: 'Id', value: id},
						...(description === null
							? []
							: [{name: 'Description', value: description}]),
						{name: 'Created At', value: formatDate(createdAt)},
						{
							name: 'Owner',
							value: `${await members.fetch(ownerId)}`
						},
						...(applicationId === null
							? []
							: [{name: 'Application Id', value: applicationId}]),
						...(icon === null ? [] : [imageField('Icon', icon)]),
						...(banner === null ? [] : [imageField('Banner', banner)]),
						...(discoverySplash === null
							? []
							: [imageField('Discovery Splash', guild.discoverySplashURL()!)]),
						{name: 'Members', value: String(memberCount)},
						{name: 'Preferred Locale', value: preferredLocale},
						...(features.length
							? [
									{
										name: 'Features',
										value: features
											.map(feature =>
												feature === 'VIP_REGIONS'
													? 'VIP Regions'
													: screamingSnakeToStartCase(feature)
											)
											.join('\n')
									}
							  ]
							: []),
						...(vanityURLCode === null
							? []
							: [
									{
										name: 'Vanity URL',
										value: `https://discord.gg/${vanityURLCode} (${
											vanityURLUses ?? 0
										}) uses`
									}
							  ]),
						...(await channelFieldData(
							'AFK Channel',
							afkChannelId,
							() => {
								let text: string
								if (afkTimeout === 3600) text = '1 hour'
								else {
									const minutes = afkTimeout / 60
									text = `${minutes} minute${minutes === 1 ? '' : 's'}`
								}
								return ` (timeout: ${text})`
							},
							chan => (chan as VoiceChannel).name
						)),
						...(systemChannelFlags.has([
							'SuppressJoinNotifications',
							'SuppressPremiumSubscriptions'
						])
							? []
							: await channelFieldData(
									'System Messages Channel',
									systemChannelId,
									() =>
										` (${systemChannelFlags
											.missing([
												'SuppressJoinNotifications',
												'SuppressPremiumSubscriptions'
											])
											.map(string => pascalToStartCase(string.slice(8))) // 'Suppress'.length === 8
											.join(', ')})`
							  )),
						...(widgetEnabled ?? false
							? await channelFieldData('Widget Channel', widgetChannelId)
							: []),
						...(await channelFieldData(
							'Community Updates Channel',
							publicUpdatesChannelId
						)),
						...(await channelFieldData('Rules Channel', rulesChannelId)),
						...(premiumSubscriptionCount ?? 0
							? [
									{
										name: 'Sever Boost Status',
										value: `${
											premiumTier === GuildPremiumTier.None
												? 'No Server Boost'
												: `Level ${premiumTier}`
										} (${premiumSubscriptionCount} boosts)`
									}
							  ]
							: []),
						{
							name: 'Default Notifications',
							value:
								defaultMessageNotifications ===
								GuildDefaultMessageNotifications.AllMessages
									? 'All Messages'
									: 'Only @mentions'
						},
						{
							name: 'Verification Level',
							value:
								verificationLevel === GuildVerificationLevel.VeryHigh
									? 'Highest'
									: GuildVerificationLevel[verificationLevel]!
						},
						{
							name: 'Requires 2FA for moderation',
							value: formatBoolean(!!mfaLevel)
						},
						{name: 'Partnered', value: formatBoolean(partnered)}
					]
				}
			]
		})
	}
}
export default command
