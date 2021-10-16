import { MessageActionRow, MessageButton } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
const options = {
    content: 'Here’s my website!',
    components: [
        new MessageActionRow({
            components: [
                new MessageButton({
                    style: 'LINK',
                    label: 'Comrade Pingu Website',
                    url: 'https://comrade-pingu--cherryblossom00.repl.co'
                })
            ]
        })
    ]
};
const command = {
    data: new SlashCommandBuilder()
        .setName('website')
        .setDescription('Sends my website.'),
    async execute(interaction) {
        await interaction.reply(options);
    }
};
export default command;
//# sourceMappingURL=website.js.map