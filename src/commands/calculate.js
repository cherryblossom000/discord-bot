import { ResultSet, evaluate, simplify } from 'mathjs';
const command = {
    name: 'calculate',
    aliases: ['c', 'calculator'],
    description: 'Calculates a maths expression.',
    syntax: '<expression>',
    usage: `\`expression\`
The expression to calculate. See https://mathjs.org/docs/expressions/syntax.html for more information.`,
    async execute(message, { input }) {
        const handleError = async (error) => {
            await message.reply(`\`${error}\``);
        };
        let result;
        try {
            result = evaluate(input);
        }
        catch (error) {
            if (error instanceof Error &&
                error.message.startsWith('Undefined symbol')) {
                try {
                    result = simplify(input);
                }
                catch (error_) {
                    await handleError(error_);
                    return;
                }
            }
            else {
                await handleError(error);
                return;
            }
        }
        await (result
            ? message.channel.send(result instanceof ResultSet
                ? result.entries.length === 1
                    ? result.entries[0].toString()
                    : result.entries.map(e => e.toString()).join('\n')
                : result.toString(), { code: true })
            : message.reply('please provide an expression to calculate!'));
    }
};
export default command;
//# sourceMappingURL=calculate.js.map