import { ActivityType, ContextMenuCommandBuilder, EmbedBuilder, hyperlink } from 'discord.js';
import { fetchTimeZone } from '../../database.js';
import { checkPermissions, createDateFormatter, fetchGuild, formatBoolean, imageField, inlineField as f, pascalToStartCase, upperFirst } from '../../utils.js';
const formatStatus = (status) => status === 'dnd' ? 'Do Not Disturb' : upperFirst(status);
const userInfoFields = (user, avatarURL, formatDate) => {
    const { avatar, createdAt, id } = user;
    const flags = user.flags?.toArray();
    return [
        f('Id', id),
        f('Joined Discord', formatDate(createdAt)),
        imageField(`Avatar${avatar == null ? ' (Default)' : ''}`, avatarURL),
        ...((flags?.length ?? 0)
            ? [
                f('Flags', flags
                    .map(flag => pascalToStartCase(flag)
                    .replace('Hypesquad', 'HypeSquad')
                    .replace('Http', 'HTTP'))
                    .join('\n'))
            ]
            : [])
    ];
};
const presenceFields = ({ activities, clientStatus, status }, formatDate) => {
    const clientStatuses = clientStatus
        ? Object.entries(clientStatus)
        : undefined;
    return [
        f('Status', `**${formatStatus(status)}**${(clientStatuses?.length ?? 0)
            ? `\n${clientStatuses
                .map(([k, v]) => `${upperFirst(k)}: ${formatStatus(v)}`)
                .join('\n')}`
            : ''}`),
        ...(activities.length
            ? activities.map(activity => f(ActivityType[activity.type] +
                (activity.type === ActivityType.Listening
                    ? ' to'
                    : activity.type === ActivityType.Competing
                        ? ' in'
                        : ''), activity.type === ActivityType.Custom
                ? (activity.emoji
                    ? `${activity.emoji.id == null
                        ? activity.emoji.name
                        : `:${activity.emoji.name}:`} `
                    : '') + activity.state
                : activity.name +
                    (activity.state == null ? '' : `\nState: ${activity.state}`) +
                    (activity.details == null
                        ? ''
                        : `\nDetails: ${activity.details}`) +
                    (activity.url == null
                        ? ''
                        : `\n${hyperlink('URL', activity.url)}`) +
                    (Number.isNaN(activity.createdAt.getTime())
                        ? ''
                        : `\nStart: ${formatDate(activity.createdAt)}`) +
                    (activity.timestamps?.end
                        ? `\nEnd: ${formatDate(activity.timestamps.end)}`
                        : '') +
                    (activity.assets?.largeText == null
                        ? ''
                        : `\nLarge Text: ${activity.assets.largeText}`) +
                    (activity.assets?.largeImage == null
                        ? ''
                        : `\n${hyperlink('Large Image URL', activity.assets.largeImageURL())}`) +
                    (activity.assets?.smallText == null
                        ? ''
                        : `\nSmall Text: ${activity.assets.smallText}`) +
                    (activity.assets?.smallImage == null
                        ? ''
                        : `\n${hyperlink('Small Image URL', activity.assets.smallImageURL())}`)))
            : [])
    ];
};
const memberInfoFields = ({ displayColor, displayHexColor, joinedAt, nickname, premiumSince, presence, roles, voice: { channel, deaf, mute, serverDeaf = false, serverMute = false, streaming } }, formatDate) => [
    ...(presence ? presenceFields(presence, formatDate) : []),
    ...(joinedAt ? [f('Joined this Server', formatDate(joinedAt))] : []),
    ...(premiumSince
        ? [f('Boosting this server since', formatDate(premiumSince))]
        : []),
    ...(nickname === null ? [] : [f('Nickname', nickname)]),
    ...(roles.cache.size > 1
        ? [
            f('Roles', roles.cache
                .filter(r => r.name !== '@everyone')
                .map(r => r.name)
                .join('\n'))
        ]
        : []),
    ...(displayColor ? [f('Colour', displayHexColor)] : []),
    ...(channel
        ? [
            f('Voice', `Channel: ${channel.name}
Muted: ${formatBoolean(mute)}${serverMute === true ? ' (server)' : ''}
Deafened: ${formatBoolean(deaf)}${serverDeaf === true ? ' (server)' : ''}
Streaming: ${formatBoolean(streaming)}`)
        ]
        : [])
];
const command = {
    data: new ContextMenuCommandBuilder().setName('Profile'),
    async execute(interaction, database) {
        if (!(await checkPermissions(interaction, ['EmbedLinks'])))
            return;
        const user = interaction.options.getUser('user', true);
        const formatDate = createDateFormatter(await fetchTimeZone(database, interaction.user.id));
        const { bot, id, tag } = user;
        const avatarURL = user.displayAvatarURL({ size: 4096 });
        await interaction.reply({
            embeds: [
                new EmbedBuilder({
                    title: tag + (bot ? ' (Bot)' : ''),
                    thumbnail: { url: avatarURL },
                    fields: [
                        ...userInfoFields(user, avatarURL, formatDate),
                        ...(interaction.inGuild()
                            ? memberInfoFields(await (await fetchGuild(interaction)).members.fetch(id), formatDate)
                            : [])
                    ],
                    footer: {
                        text: `Requested by ${interaction.user.tag}`,
                        iconURL: interaction.user.displayAvatarURL()
                    },
                    timestamp: Date.now()
                })
            ]
        });
    }
};
export default command;
//# sourceMappingURL=profile.js.map