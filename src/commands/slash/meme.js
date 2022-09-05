import { SlashCommandBuilder, hyperlink } from 'discord.js';
import { checkPermissions } from '../../utils.js';
const IWMELC = 'I will murder every last capitalist';
const HTKB = 'how to kiss boy';
const imagesFolder = new URL('../../../assets/img/', import.meta.url);
const iwmelc = new URL('iwmelc.jpg', imagesFolder).pathname;
const htkb = new URL('htkb.jpg', imagesFolder).pathname;
const MEME = 'meme';
const command = {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('Gets a Pingu-related meme.')
        .addStringOption(option => option
        .setName(MEME)
        .setDescription('The meme to get.')
        .setRequired(true)
        .addChoices({ name: IWMELC, value: "iwmelc" }, { name: HTKB, value: "htkb" })),
    usage: `!${hyperlink(IWMELC, './assets/img/iwmelc.jpg')}<br><img src="./assets/img/htkb.jpg" alt="${HTKB}" width="320">`,
    async execute(interaction) {
        if (!(await checkPermissions(interaction, ['AttachFiles'])))
            return;
        await interaction.reply({
            files: [
                interaction.options.getString(MEME, true) === "iwmelc"
                    ? iwmelc
                    : htkb
            ]
        });
    }
};
export default command;
//# sourceMappingURL=meme.js.map