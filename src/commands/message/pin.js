import { ContextMenuCommandBuilder, Routes, hyperlink } from 'discord.js';
import { fetchValue } from '../../database.js';
import { checkPermissions } from '../../utils.js';
const command = {
    data: new ContextMenuCommandBuilder()
        .setName('Pin Message')
        .setDMPermission(false),
    async execute(interaction, database) {
        if (!((await fetchValue(database, 'guilds', interaction.guildId, 'enablePinning')) ?? false)) {
            await interaction.reply({
                content: 'You can’t pin messages here! Noot noot.',
                ephemeral: true
            });
            return;
        }
        if (!(await checkPermissions(interaction, ['ManageMessages'])))
            return;
        const { channelId, client, guildId, options, user } = interaction;
        const messageId = options.getMessage('message', true).id;
        await client.rest.put(Routes.channelPin(channelId, messageId), {
            reason: `‘Pin Message’ from ${user.tag} (${user.id})`
        });
        await interaction.reply({
            content: `Pinned ${hyperlink(`message ${messageId}`, `https://discord.com/channels/${guildId}/${channelId}/${messageId}`)}. Noot noot.`,
            flags: 'SuppressEmbeds'
        });
    }
};
export default command;
//# sourceMappingURL=pin.js.map