import sharp from 'sharp'
import {checkPermissions, handleError} from '../utils'
import type {MathJax} from 'mathjax'
import type {LiteElement} from 'mathjax-full/js/adaptors/lite/Element'
import type {LiteText} from 'mathjax-full/js/adaptors/lite/Text'
import type {Command} from '../types'

const PADDING = 20
const WHITE = '#ffffff'
let mathJax: MathJax | undefined

const command: Command = {
  name: 'maths',
  aliases: ['m', 'math', 'mathsimage', 'latex'],
  description: 'Convert LaTeX into an image.',
  args: true,
  syntax: '<LaTeX>',
  usage: `\`LaTeX\`
The LaTeX to convert. See http://docs.mathjax.org/en/latest/input/tex/macros/index.html for supported tags (ams is the only package loaded).`,
  async execute(message, {input}) {
    if (message.guild && !(await checkPermissions(message, 'ATTACH_FILES')))
      return

    if (!mathJax) {
      // eslint-disable-next-line require-atomic-updates -- not a race condition
      mathJax = await (await import('mathjax')).init({
        loader: {
          load: ['input/tex-base', '[tex]/ams', 'output/svg'],
          failed: (error): void =>
            handleError(message.client, error, 'MathJax loader error')
        },
        startup: {typeset: false},
        tex: {packages: {'[+]': ['ams']}},
        svg: {internalSpeechTitles: false}
      })
    }

    const [svg] = mathJax.tex2svg(input).children as [LiteElement]
    const [g] = (svg.children[1] as LiteElement).children as [LiteElement]

    const [maybeErrorG] = g.children as [LiteElement]
    // Syntax error
    if (maybeErrorG.attributes['data-mml-node'] === 'merror') {
      await message.reply(
        `there was a syntax error: ${
          (((maybeErrorG.children[1] as LiteElement).children[0] as LiteElement)
            .children[0] as LiteText).value
        }`
      )
      return
    }

    // Empty
    if (
      g.children.every(
        node =>
          node.kind === 'g' &&
          (node as LiteElement).attributes['data-mml-node'] === 'TeXAtom' &&
          !(node as LiteElement).children.length
      )
    ) {
      await message.reply(`\`${input}\` evaluates to an empty expression!`)
      return
    }

    await message.channel.send({
      files: [
        {
          attachment: await sharp(
            Buffer.from(mathJax.startup.adaptor.outerHTML(svg)),
            {density: 300}
          )
            .flatten({background: WHITE})
            .extend({
              top: PADDING,
              left: PADDING,
              bottom: PADDING,
              right: PADDING,
              background: WHITE
            })
            .png()
            .toBuffer()
        }
      ]
    })
  }
}
export default command
