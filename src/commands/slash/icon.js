import { SlashCommandBuilder } from '@discordjs/builders';
import { checkPermissions, fetchGuild, replyDeletable } from '../../utils.js';
const command = {
    data: new SlashCommandBuilder()
        .setName('icon')
        .setDescription('Gets the server icon.'),
    guildOnly: true,
    async execute(interaction) {
        if (!(await checkPermissions(interaction, 'ATTACH_FILES')))
            return;
        const icon = (await fetchGuild(interaction)).iconURL({ size: 4096 });
        await replyDeletable(interaction, icon === null
            ? 'This server doesn’t have an icon! Noot noot.'
            : { files: [icon] });
    }
};
export default command;
//# sourceMappingURL=icon.js.map