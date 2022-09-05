import { EmbedBuilder, SlashCommandBuilder, bold } from 'discord.js';
import { checkPermissions, request } from '../../utils.js';
const baseURL = 'https://api.urbandictionary.com/v0/define';
const QUERY = 'query';
const command = {
    data: new SlashCommandBuilder()
        .setName('urban')
        .setDescription('Gets a definition from the Urban Dictionary.')
        .addStringOption(option => option
        .setName(QUERY)
        .setDescription('The word/phrase to define.')
        .setRequired(true)),
    async execute(interaction) {
        if (!(await checkPermissions(interaction, ['EmbedLinks'])))
            return;
        const query = interaction.options.getString(QUERY, true);
        const url = new URL(baseURL);
        url.searchParams.set('term', query);
        const [def] = (await (await request('Fetching definition from Urban Dictionary', url)).json()).list;
        if (!def) {
            await interaction.reply(`No definition found for ${bold(query)}. Noot noot.`);
            return;
        }
        const { word, definition, example, permalink, author, thumbs_up, thumbs_down, written_on } = def;
        await interaction.reply({
            embeds: [
                new EmbedBuilder({
                    author: { name: author },
                    title: word,
                    url: permalink,
                    description: definition,
                    fields: [
                        { name: 'Example', value: example },
                        { name: '👍', value: String(thumbs_up), inline: true },
                        { name: '👎', value: String(thumbs_down), inline: true }
                    ],
                    footer: { text: 'Written on' },
                    timestamp: new Date(written_on)
                })
            ]
        });
    }
};
export default command;
//# sourceMappingURL=urban.js.map