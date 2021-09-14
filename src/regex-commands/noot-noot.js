const command = {
    regex: /no{2,}t\s*no{2,}t/iu,
    regexMessage: message => `Noot noot, comrade ${message.guild ? message.member.displayName : message.author.username}.`
};
export default command;
//# sourceMappingURL=noot-noot.js.map