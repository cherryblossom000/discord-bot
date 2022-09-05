import { SlashCommandBuilder, hyperlink, inlineCode } from 'discord.js';
import sharp from 'sharp';
import { checkPermissions, handleError, replyDeletable } from '../../utils.js';
const PADDING = 20;
const WHITE = '#ffffff';
let mathJax;
const LATEX = 'latex';
const command = {
    data: new SlashCommandBuilder()
        .setName('maths')
        .setDescription('Convert LaTeX into an image.')
        .addStringOption(option => option
        .setName(LATEX)
        .setRequired(true)
        .setDescription('The LaTeX to convert.')),
    usage: `See ${hyperlink('the MathJax docs', 'http://docs.mathjax.org/en/latest/input/tex/macros/index.html')} for supported tags. ${inlineCode('ams')} is the only package loaded.`,
    async execute(interaction) {
        if (!(await checkPermissions(interaction, ['AttachFiles'])))
            return;
        const input = interaction.options.getString(LATEX, true);
        if (!mathJax) {
            mathJax = await (await import('mathjax')).init({
                loader: {
                    load: ['input/tex-base', '[tex]/ams', 'output/svg'],
                    failed: (error) => handleError(interaction.client, error, 'MathJax loader error')
                },
                startup: { typeset: false },
                tex: { packages: { '[+]': ['ams'] } },
                svg: { internalSpeechTitles: false }
            });
        }
        const [svg] = mathJax.tex2svg(input).children;
        const [g] = svg.children[1].children;
        const [maybeErrorG] = g.children;
        if (maybeErrorG.attributes['data-mml-node'] === 'merror') {
            await interaction.reply(`There was a syntax error: ${maybeErrorG.children[1]
                .children[0].children[0].value}`);
            return;
        }
        if (g.children.every(node => node.kind === 'g' &&
            node.attributes['data-mml-node'] === 'TeXAtom' &&
            !node.children.length)) {
            await replyDeletable(interaction, `${inlineCode(input)} evaluates to an empty expression!`);
            return;
        }
        await replyDeletable(interaction, {
            files: [
                {
                    attachment: await sharp(Buffer.from(mathJax.startup.adaptor.outerHTML(svg)), { density: 300 })
                        .flatten({ background: WHITE })
                        .extend({
                        top: PADDING,
                        left: PADDING,
                        bottom: PADDING,
                        right: PADDING,
                        background: WHITE
                    })
                        .toBuffer()
                }
            ]
        });
    }
};
export default command;
//# sourceMappingURL=maths.js.map