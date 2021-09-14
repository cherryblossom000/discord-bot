import sharp from 'sharp';
import { checkPermissions, handleError } from '../utils.js';
const PADDING = 20;
const WHITE = '#ffffff';
let mathJax;
const command = {
    name: 'maths',
    aliases: ['m', 'math', 'mathsimage', 'latex'],
    description: 'Convert LaTeX into an image.',
    args: 1,
    syntax: '<LaTeX>',
    usage: `\`LaTeX\`
The LaTeX to convert. See http://docs.mathjax.org/en/latest/input/tex/macros/index.html for supported tags (ams is the only package loaded).`,
    async execute(message, { input }) {
        if (message.guild && !(await checkPermissions(message, 'ATTACH_FILES')))
            return;
        if (!mathJax) {
            mathJax = await (await import('mathjax')).init({
                loader: {
                    load: ['input/tex-base', '[tex]/ams', 'output/svg'],
                    failed: (error) => handleError(message.client, error, 'MathJax loader error')
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
            await message.reply(`there was a syntax error: ${maybeErrorG.children[1]
                .children[0].children[0].value}`);
            return;
        }
        if (g.children.every(node => node.kind === 'g' &&
            node.attributes['data-mml-node'] === 'TeXAtom' &&
            !node.children.length)) {
            await message.reply(`\`${input}\` evaluates to an empty expression!`);
            return;
        }
        await message.channel.send({
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