export const replyDeletable = async (interaction, content, followUp = false) => {
    await (followUp ? interaction.followUp(content) : interaction.reply(content));
};
//# sourceMappingURL=message.js.map