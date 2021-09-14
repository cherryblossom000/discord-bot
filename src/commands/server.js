import { fetchTimeZone } from '../database.js';
import { startCase } from '../lodash.js';
import { checkPermissions, createDateFormatter, formatBoolean, imageField } from '../utils.js';
const command = {
    name: 'server',
    aliases: ['sv', 'guild', 'g'],
    description: 'Gets information on this server.',
    guildOnly: true,
    async execute(message, _, database) {
        const { author, channel, client: { channels }, guild } = message;
        if (!(await checkPermissions(message, 'EMBED_LINKS')))
            return;
        const { afkChannelID, afkTimeout, applicationID, createdAt, defaultMessageNotifications, description, discoverySplash, features, id, memberCount, members, mfaLevel, name, ownerID, partnered, publicUpdatesChannelID, preferredLocale, premiumSubscriptionCount, premiumTier, region, rulesChannelID, systemChannelFlags, systemChannelID, vanityURLCode, vanityURLUses, verificationLevel, widgetChannelID, widgetEnabled } = guild;
        const formatDate = createDateFormatter(await fetchTimeZone(database, author));
        const channelFieldData = async (fieldName, channelID, getSuffix = () => '', value = (chan) => `${chan}`) => {
            if (channelID === null)
                return [];
            const suffix = getSuffix();
            let field;
            try {
                field = {
                    name: fieldName,
                    value: value(await channels.fetch(channelID)) + suffix
                };
            }
            catch {
                field = {
                    name: `${fieldName} ID`,
                    value: channelID + suffix
                };
            }
            return [field];
        };
        const icon = guild.iconURL();
        const banner = guild.bannerURL();
        await channel.send({
            embed: {
                title: name,
                thumbnail: icon === null ? undefined : { url: icon },
                image: banner === null ? undefined : { url: banner },
                fields: [
                    { name: 'ID', value: id },
                    ...(description === null
                        ? []
                        : [{ name: 'Description', value: description }]),
                    { name: 'Created At', value: formatDate(createdAt) },
                    {
                        name: 'Owner',
                        value: `${await members.fetch(ownerID)}`
                    },
                    ...(applicationID === null
                        ? []
                        : [{ name: 'Application ID', value: applicationID }]),
                    ...(icon === null ? [] : [imageField('Icon', icon)]),
                    ...(banner === null ? [] : [imageField('Banner', banner)]),
                    ...(discoverySplash === null
                        ? []
                        : [imageField('Discovery Splash', guild.discoverySplashURL())]),
                    { name: 'Members', value: memberCount },
                    { name: 'Preferred Locale', value: preferredLocale },
                    { name: 'Region', value: region },
                    ...(features.length
                        ? [
                            {
                                name: 'Features',
                                value: features
                                    .map(feature => feature === 'VIP_REGIONS'
                                    ? 'VIP Regions'
                                    : startCase(feature))
                                    .join('\n')
                            }
                        ]
                        : []),
                    ...(vanityURLCode === null
                        ? []
                        : [
                            {
                                name: 'Vanity URL',
                                value: `https://discord.gg/${vanityURLCode} (${vanityURLUses ?? 0}) uses`
                            }
                        ]),
                    ...(await channelFieldData('AFK Channel', afkChannelID, () => {
                        let text;
                        if (afkTimeout === 3600)
                            text = '1 hour';
                        else {
                            const minutes = afkTimeout / 60;
                            text = `${minutes} minute${minutes === 1 ? '' : 's'}`;
                        }
                        return ` (timeout: ${text})`;
                    }, chan => chan.name)),
                    ...(systemChannelFlags.has([
                        'WELCOME_MESSAGE_DISABLED',
                        'BOOST_MESSAGE_DISABLED'
                    ])
                        ? []
                        : await channelFieldData('System Messages Channel', systemChannelID, () => ` (${systemChannelFlags
                            .missing([
                            'WELCOME_MESSAGE_DISABLED',
                            'BOOST_MESSAGE_DISABLED'
                        ])
                            .map(string => string.split('_')[0].toLowerCase())
                            .join(', ')})`)),
                    ...(widgetEnabled ?? false
                        ? await channelFieldData('Widget Channel', widgetChannelID)
                        : []),
                    ...(await channelFieldData('Community Updates Channel', publicUpdatesChannelID)),
                    ...(await channelFieldData('Rules Channel', rulesChannelID)),
                    ...(premiumSubscriptionCount ?? 0
                        ? [
                            {
                                name: 'Sever Boost Status',
                                value: `${premiumTier ? `Level ${premiumTier}` : 'No Server Boost'} (${premiumSubscriptionCount} boosts)`
                            }
                        ]
                        : []),
                    {
                        name: 'Default Notifications',
                        value: defaultMessageNotifications === 'ALL'
                            ? 'All Messages'
                            : 'Only @mentions'
                    },
                    {
                        name: 'Verification Level',
                        value: verificationLevel === 'VERY_HIGH'
                            ? 'Highest'
                            : startCase(verificationLevel)
                    },
                    {
                        name: 'Requires 2FA for moderation',
                        value: formatBoolean(!!mfaLevel)
                    },
                    { name: 'Partnered', value: formatBoolean(partnered) }
                ]
            }
        });
    }
};
export default command;
//# sourceMappingURL=server.js.map