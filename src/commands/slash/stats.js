import { SlashCommandBuilder } from '@discordjs/builders';
const command = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Gets my stats.'),
    async execute(interaction) {
        const { client: { channels, guilds, users } } = interaction;
        await interaction.reply(`Users: ${users.cache.size}
Channels: ${channels.cache.size}
Guilds: ${guilds.cache.size}`);
    }
};
export default command;
//# sourceMappingURL=stats.js.map