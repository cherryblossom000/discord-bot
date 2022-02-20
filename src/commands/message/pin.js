import { hyperlink } from '@discordjs/builders';
import { fetchValue } from '../../database.js';
import { checkPermissions, fetchMessage } from '../../utils.js';
const command = {
    name: 'Pin Message',
    guildOnly: true,
    async execute(interaction, database) {
        if (!((await fetchValue(database, 'guilds', interaction.guildId, 'enablePinning')) ?? false)) {
            await interaction.reply({
                content: 'You can’t pin messages here! Noot noot.'
            });
            return;
        }
        if (!(await checkPermissions(interaction, 'MANAGE_MESSAGES')))
            return;
        const message = await fetchMessage(interaction);
        await message.pin();
        await interaction.reply(`Pinned ${hyperlink(`message ${message.id}`, message.url)}. Noot noot.`);
    }
};
export default command;
//# sourceMappingURL=pin.js.map