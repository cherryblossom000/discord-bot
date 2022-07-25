import {SlashCommandBuilder, hyperlink, inlineCode} from 'discord.js'
import sharp from 'sharp'
import {checkPermissions, handleError, replyDeletable} from '../../utils.js'
import type {MathJax} from 'mathjax'
import type {LiteElement} from 'mathjax-full/js/adaptors/lite/Element'
import type {LiteText} from 'mathjax-full/js/adaptors/lite/Text'
import type {AnySlashCommand} from '../../types'

const PADDING = 20
const WHITE = '#ffffff'
let mathJax: MathJax | undefined

const LATEX = 'latex'

const command: AnySlashCommand = {
	data: new SlashCommandBuilder()
		.setName('maths')
		.setDescription('Convert LaTeX into an image.')
		.addStringOption(option =>
			option
				.setName(LATEX)
				.setRequired(true)
				.setDescription('The LaTeX to convert.')
		),
	usage: `See ${hyperlink(
		'the MathJax docs',
		'http://docs.mathjax.org/en/latest/input/tex/macros/index.html'
	)} for supported tags. ${inlineCode('ams')} is the only package loaded.`,
	async execute(interaction) {
		if (!(await checkPermissions(interaction, ['AttachFiles']))) return

		const input = interaction.options.getString(LATEX, true)
		if (!mathJax) {
			// eslint-disable-next-line require-atomic-updates -- not a race condition
			mathJax = await (
				await import('mathjax')
			).init({
				loader: {
					load: ['input/tex-base', '[tex]/ams', 'output/svg'],
					failed: (error): void =>
						handleError(interaction.client, error, 'MathJax loader error')
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
			await interaction.reply(
				`There was a syntax error: ${
					(
						(
							(maybeErrorG.children[1] as LiteElement)
								.children[0] as LiteElement
						).children[0] as LiteText
					).value
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
			await replyDeletable(
				interaction,
				`${inlineCode(input)} evaluates to an empty expression!`
			)
			return
		}

		await replyDeletable(interaction, {
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
						.toBuffer()
				}
			]
		})
	}
}
export default command
