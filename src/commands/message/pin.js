import { hyperlink } from '@discordjs/builders';
import { fetchValue } from '../../database.js';
import { checkPermissions } from '../../utils.js';
const command = {
    name: 'Pin Message',
    guildOnly: true,
    async execute(interaction, database) {
        if (!((await fetchValue(database, 'guilds', interaction.guildId, 'enablePinning')) ?? false)) {
            await interaction.reply({
                content: 'You can’t pin messages here! Noot noot.',
                ephemeral: true
            });
            return;
        }
        if (!(await checkPermissions(interaction, 'MANAGE_MESSAGES')))
            return;
        const { channelId, client, guildId, id, options, token, user } = interaction;
        const messageId = options.getMessage('message', true).id;
        await client['api']
            .channels(channelId)
            .pins(messageId)
            .put({ reason: `‘Pin Message’ from ${user.tag} (${user.id})` });
        await client['api']
            .interactions(id, token)
            .callback.post({
            data: {
                type: 4,
                data: {
                    content: `Pinned ${hyperlink(`message ${messageId}`, `https://discord.com/channels/${guildId}/${channelId}/${messageId}`)}. Noot noot.`,
                    flags: 4
                }
            }
        });
        interaction.replied = true;
    }
};
export default command;
//# sourceMappingURL=pin.js.map