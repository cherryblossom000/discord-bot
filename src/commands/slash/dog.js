import { SlashCommandBuilder } from '@discordjs/builders';
import { checkPermissions, request } from '../../utils.js';
const randomDog = 'https://random.dog/';
const command = {
    data: new SlashCommandBuilder()
        .setName('dog')
        .setDescription('Gets a random image of a dog from random.dog.'),
    async execute(interaction) {
        if (!(await checkPermissions(interaction, ['ATTACH_FILES', 'EMBED_LINKS'])))
            return;
        await interaction.reply({
            embeds: [
                {
                    image: {
                        url: randomDog +
                            (await (await request('Fetching dog image from random.dog', `${randomDog}woof?filter=mp4`)).text())
                    },
                    footer: { text: 'Provided by random.dog.' }
                }
            ]
        });
    }
};
export default command;
//# sourceMappingURL=dog.js.map