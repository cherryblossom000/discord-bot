import { readFile } from 'node:fs/promises';
import { SlashCommandBuilder, inlineCode } from 'discord.js';
const { version } = JSON.parse(await readFile(new URL('../../../package.json', import.meta.url).pathname, 'utf8'));
const command = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Gets info about me.'),
    async execute(interaction) {
        await interaction.reply(`Version: ${inlineCode(version)}
I am comrade Pingu. Noot noot.
Kill all the capitalist scum!
I was created by cherryblossom#2661.`);
    }
};
export default command;
//# sourceMappingURL=info.js.map