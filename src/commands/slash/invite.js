import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageActionRow, MessageButton } from 'discord.js';
import { permissions } from '../../constants.js';
let options;
const command = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Gets my invite link.'),
    async execute(interaction) {
        await interaction.reply((options ??= {
            content: 'Invite me using this link!',
            components: [
                new MessageActionRow({
                    components: [
                        new MessageButton({
                            style: 'LINK',
                            label: 'Invite link',
                            url: interaction.client.generateInvite({
                                scopes: ['applications.commands', 'bot'],
                                permissions
                            })
                        })
                    ]
                })
            ]
        }));
    }
};
export default command;
//# sourceMappingURL=invite.js.map