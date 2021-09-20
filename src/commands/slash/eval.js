import { inspect } from 'node:util';
import { SlashCommandBuilder, codeBlock, inlineCode } from '@discordjs/builders';
import Discord, { Util } from 'discord.js';
import { emojis, me } from '../../constants.js';
import { replyDeletable } from '../../utils.js';
const AsyncFunction = (async () => { })
    .constructor;
const JAVASCRIPT = 'javascript';
const HIDE_RESULT = 'hide-result';
const EPHEMERAL = 'ephemeral';
const command = {
    data: new SlashCommandBuilder()
        .setName('eval')
        .setDescription('Evaluates some JS.')
        .setDefaultPermission(false)
        .addStringOption(option => option
        .setName(JAVASCRIPT)
        .setRequired(true)
        .setDescription('The code to execute.'))
        .addBooleanOption(option => option
        .setName(HIDE_RESULT)
        .setDescription('Prevent me from sending the result. Defaults to False.'))
        .addBooleanOption(option => option
        .setName(EPHEMERAL)
        .setDescription('Whether or not to send the reply as an ephemeral one. Defaults to False.')),
    permissions: [
        { id: me, type: 1, permission: true }
    ],
    hidden: true,
    usage: `The following variables are available:
- ${inlineCode('interaction: Discord.Interaction')}: The slash command interaction you sent.
- ${inlineCode('Discord: Discord')}: The discord.js module.`,
    async execute(interaction, database) {
        const ephemeral = interaction.options.getBoolean(EPHEMERAL) ?? false;
        let result;
        try {
            result = await AsyncFunction('interaction', 'database', 'Discord', `return (${interaction.options.getString(JAVASCRIPT, true)})`)(interaction, database, Discord);
        }
        catch (error) {
            await replyDeletable(interaction, {
                content: codeBlock(`${error}`),
                ephemeral
            });
            return;
        }
        await (interaction.options.getBoolean(HIDE_RESULT) ?? false
            ? interaction.reply({ content: emojis.thumbsUp, ephemeral: true })
            : Promise.all(Util.splitMessage(['TOKEN', 'DB_USER', 'DB_PASSWORD', 'REPLIT_DB_URL'].reduce((acc, key) => {
                const value = process.env[key];
                return value === undefined
                    ? acc
                    : acc.replaceAll(value, `<${key}>`);
            }, inspect(result))).map(async (text, i) => replyDeletable(interaction, {
                content: codeBlock('js', text),
                ephemeral
            }, i !== 0))));
    }
};
export default command;
//# sourceMappingURL=eval.js.map