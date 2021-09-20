import { SlashCommandBuilder } from '@discordjs/builders';
import fetch from 'node-fetch';
import sharp from 'sharp';
import { handleError } from '../../utils.js';
const ANGLE = 'angle';
const ATTACHMENT = 'attachment';
const command = {
    data: new SlashCommandBuilder()
        .setName('rotate')
        .setDescription('Rotates an image.')
        .addNumberOption(option => option
        .setName(ANGLE)
        .setDescription('The angle in degrees to rotate the image clockwise. Negative values work as well!')
        .setRequired(true))
        .addIntegerOption(option => option
        .setName(ATTACHMENT)
        .setDescription('The index of the attachment/image you want to rotate. Defaults to 1 (the first image).')),
    usage: 'Use Rotate Image after right-clicking on a message with the image you want to rotate, and then use this command. Negative angles rotate the image counterclockwise.',
    async execute(interaction) {
        const attachments = interaction.client.rotateAttachments.get(interaction.user.id);
        if (!attachments) {
            await interaction.reply({
                content: 'Use the Rotate Image command on the message that has the image you want to rotate first!',
                ephemeral: true
            });
            return;
        }
        const attachmentIdx = interaction.options.getInteger(ATTACHMENT) ?? 1;
        const attachment = attachments[attachmentIdx - 1];
        if (!attachment) {
            await interaction.reply({
                content: `The message only has ${attachments.length} attachments (you wanted to rotate attachment ${attachmentIdx})!`,
                ephemeral: true
            });
            return;
        }
        const angle = interaction.options.getNumber(ANGLE, true);
        await interaction.deferReply();
        let buffer;
        try {
            buffer = await sharp(Buffer.from(await (await fetch(attachment.url)).arrayBuffer()))
                .rotate(angle)
                .toBuffer();
        }
        catch (error) {
            handleError(interaction.client, error, `Error rotating image ${attachment.url}`, {
                to: interaction,
                response: 'there was an error rotating the image!',
                followUp: true
            });
            return;
        }
        await interaction.editReply({
            files: [{ attachment: buffer, name: attachment.name ?? undefined }]
        });
    }
};
export default command;
//# sourceMappingURL=rotate.js.map