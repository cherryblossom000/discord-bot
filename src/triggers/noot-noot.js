const trigger = {
    regex: /no{2,}t\s*no{2,}t/iu,
    message: async (message) => `Noot noot, comrade ${message.inGuild()
        ? (await (await message.client.guilds.fetch(message.guildId)).members.fetch(message.author)).displayName
        : message.author.username}.`
};
export default trigger;
//# sourceMappingURL=noot-noot.js.map