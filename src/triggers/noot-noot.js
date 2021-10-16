const trigger = {
    regex: /no{2,}t\s*no{2,}t/iu,
    message: message => `Noot noot, comrade ${message.guild ? message.member.displayName : message.author.username}.`
};
export default trigger;
//# sourceMappingURL=noot-noot.js.map