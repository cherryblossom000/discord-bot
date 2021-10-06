import { SlashCommandBuilder } from '@discordjs/builders';
import { Constants } from 'discord.js';
const EMOJI = 'emoji';
const command = {
    data: new SlashCommandBuilder()
        .setName('emoji')
        .setDescription('Gets the image for an emoji.')
        .addStringOption(option => option
        .setName(EMOJI)
        .setRequired(true)
        .setDescription('The emoji to get the image of.')),
    async execute(interaction) {
        const input = interaction.options.getString(EMOJI, true);
        const match = /<(a?):[\w]+:(\d+)>/u.exec(input);
        if (!match) {
            await interaction.reply('Please provide an emoji!');
            return;
        }
        const [, animated, id] = match;
        await interaction.reply({
            files: [
                Constants.Endpoints.CDN(interaction.client.options.http.cdn).Emoji(id, animated ? 'gif' : 'png')
            ]
        });
    }
};
export default command;
//# sourceMappingURL=emoji.js.map