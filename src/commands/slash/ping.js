import { SlashCommandBuilder } from 'discord.js';
const command = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Gets my current latency.'),
    async execute(interaction) {
        await interaction.reply('Pinging…');
        await interaction.editReply(`Noot noot!
Latency: ${Date.now() - interaction.createdTimestamp} ms
Websocket: ${interaction.client.ws.ping} ms`);
    }
};
export default command;
//# sourceMappingURL=ping.js.map