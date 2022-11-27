import fs, {mkdir, writeFile} from 'node:fs/promises'
import {
	ApplicationCommandOptionType,
	inlineCode,
	type APIApplicationCommandSubcommandOption
} from 'discord.js'
import MarkdownIt from 'markdown-it'
import {markdownTable} from 'markdown-table'
import {permissions} from '@comrade-pingu/bot/dist/src/constants.js'
import {
	formatCommandSyntax,
	formatCommandUsage,
	upperFirst,
	type FormatCommandSyntaxInput,
	type FormatCommandInput
} from '@comrade-pingu/bot/dist/src/utils.js'
import {slashCommands} from './commands.js'
import {botDistFolder, botFolder, scriptsFolder} from './folders.js'
import exitOnError from './exit-on-error.js'
import type {PathLike} from 'node:fs'

exitOnError()

const readFile = async (filePath: PathLike): Promise<string> =>
	fs.readFile(filePath, 'utf8')

const htmlFolder = new URL('assets/html/', botDistFolder)
const readmeFile = new URL('README.md', botFolder)

const br = '<br>'

const formatCommand = (
	command: FormatCommandInput,
	usage: string | undefined,
	prefix?: string,
	includeDescription = false
): string => {
	const {name, options = []} = command
	const resolvedPrefix = prefix === undefined ? '' : `${prefix} `
	if (
		options[0]?.type === ApplicationCommandOptionType.Subcommand ||
		options[0]?.type === ApplicationCommandOptionType.SubcommandGroup
	) {
		return options
			.map(opt =>
				formatCommand(
					opt as APIApplicationCommandSubcommandOption,
					undefined,
					resolvedPrefix + name,
					true
				)
			)
			.join(br + br)
	}
	return (
		formatCommandSyntax(command as FormatCommandSyntaxInput, {
			prefix,
			includeDescription,
			pipeChar: '\\|' // escape for table
		}) +
		(options.length
			? br +
			  options
					.map(
						opt =>
							inlineCode(opt.name) +
							(opt.description ? `: ${opt.description}` : '')
					)
					.join(br)
			: '') +
		formatCommandUsage(usage, br)
	)
}

const docs = [
	['Command', 'Description', 'Usage'],
	...slashCommands
		.filter(({hidden = false}) => !hidden)
		.map(({data, usage}) => {
			const command = data.toJSON()
			const {name, description} = command
			return [inlineCode(name), description, formatCommand(command, usage)]
		})
]

const [newReadme, template] = await Promise.all([
	// Replace old readme docs
	// eslint-disable-next-line unicorn/prefer-top-level-await -- Promise.all
	readFile(readmeFile).then(s =>
		s
			.replace(
				/(?<=<!-- DOCS START -->\n\n)[\s\S]*(?=\n\n<!-- DOCS END -->)/u,
				markdownTable(docs, {alignDelimiters: false})
			)
			.replace(/(?<=permissions=)\d+/u, String(permissions))
	),
	// Get HTML template
	readFile(new URL('template.html', scriptsFolder)),
	// Ensure output folder dist/assets/html exists
	mkdir(htmlFolder, {recursive: true})
])

const htmlMarkdownIt = new MarkdownIt({html: true})
const writeHtml = async (
	p: string,
	title: string,
	description: string,
	path_: string,
	md: string
): Promise<void> =>
	writeFile(
		new URL(`${p}.html`, htmlFolder),
		template
			.replaceAll('[title]', title)
			.replaceAll('[description]', description)
			.replace('[path]', path_)
			.replace('[content]', htmlMarkdownIt.render(md))
	)

const writeOtherPage = async (htmlPath: string, mdFile: URL): Promise<void> => {
	const title = upperFirst(htmlPath)
	return writeHtml(
		htmlPath,
		`${title} - Comrade Pingu`,
		`${title} for Comrade Pingu`,
		`/${htmlPath}`,
		`${await readFile(mdFile)}
#### [← back](/)`
	)
}

await Promise.all([
	// Update readme
	writeFile(readmeFile, newReadme),
	// Update index.html
	writeHtml(
		'index',
		'Comrade Pingu',
		'Kill all the capitalist scum!',
		'',
		newReadme
			.replaceAll('./assets/img', '')
			.replace('LICENSE', 'license')
			.replace('CHANGELOG.md', 'changelog')
	),
	// Update license.html and changelog.html
	writeOtherPage('license', new URL('../../LICENSE', scriptsFolder)),
	writeOtherPage('changelog', new URL('CHANGELOG.md', botFolder))
])
