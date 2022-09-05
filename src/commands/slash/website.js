import { ButtonBuilder, ButtonStyle, ComponentType, SlashCommandBuilder } from 'discord.js';
const options = {
    content: 'Here’s my website!',
    components: [
        {
            type: ComponentType.ActionRow,
            components: [
                new ButtonBuilder({
                    style: ButtonStyle.Link,
                    label: 'Comrade Pingu Website',
                    url: 'https://comrade-pingu--cherryblossom00.repl.co'
                })
            ]
        }
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