import { SlashCommandBuilder, codeBlock, hyperlink, inlineCode } from '@discordjs/builders';
import { ResultSet, evaluate, simplify } from 'mathjs';
const EXPRESSION = 'expression';
const command = {
    data: new SlashCommandBuilder()
        .setName('calculate')
        .setDescription('Calculates a maths expression.')
        .addStringOption(option => option
        .setName(EXPRESSION)
        .setRequired(true)
        .setDescription('The expression to calculate.')),
    usage: `See ${hyperlink('the mathjs docs', 'https://mathjs.org/docs/expressions/syntax.html')} for more information on the syntax of ${inlineCode(EXPRESSION)}.`,
    async execute(interaction) {
        const handleError = async (error) => {
            await interaction.reply(inlineCode(String(error)));
        };
        const input = interaction.options.getString(EXPRESSION, true);
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
        await interaction.reply(codeBlock(result instanceof ResultSet
            ? result.entries.length === 1
                ? result.entries[0].toString()
                : result.entries.map(e => e.toString()).join('\n')
            : result.toString()));
    }
};
export default command;
//# sourceMappingURL=calculate.js.map