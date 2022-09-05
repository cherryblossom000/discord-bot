import { SlashCommandBuilder } from 'discord.js';
import ms from 'ms';
const command = {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Gets my uptime.'),
    async execute(interaction) {
        await interaction.reply(`Uptime: ${ms(interaction.client.uptime)}`);
    }
};
export default command;
//# sourceMappingURL=uptime.js.map