import {promises, readdirSync} from 'fs'
import {join, resolve} from 'path'
import {Permissions} from 'discord.js'
import upperFirst from 'lodash.upperfirst'
import MarkdownIt from 'markdown-it'
import table from 'markdown-table'
import {permissions} from '../src/constants'
import type {Command} from '../src/types'
import exitOnError, {exit} from './exitOnError'

const {mkdir, readFile, writeFile} = promises

exitOnError()

const commandsPath = resolve('dist/src/commands')
const readme = resolve('README.md')

;(async (): Promise<void> => {
  // Update readme
  const files = readdirSync(commandsPath)
  const modules = await Promise.all(files
    .filter(f => !f.endsWith('.map'))
    .map(async f => import(join(commandsPath, f))))
  const commands = modules.map(m => (m as {default: Command<boolean>}).default)
  const usageMarkdownIt = new MarkdownIt({html: true, breaks: true})
  const docs = [['Command', 'Aliases', 'Description', 'Usage', 'Cooldown (s)'],
    ...commands
      .filter(({hidden = false}) => !hidden)
      .map(
        ({name, aliases, description, syntax, usage, cooldown = 3}) => [
          `\`${name}\``,
          aliases?.map(a => `\`${a}\``).join(', ') ?? '-',
          name === 'iwmelc'
            ? `${description}<br>![i will murder every last capitalist](./assets/img/iwmelc.jpg)`
            : name === 'htkb' ? `${description}<br>![how to kiss boy](./assets/img/htkb.png)` : description,
          `\`.${name}${syntax === undefined ? '' : ` ${syntax.replace(/\|/ug, '\\|')}`}\`${usage === undefined
            ? ''
            : `<br>${(name === 'play' || name === 'volume'
              ? usageMarkdownIt.render(usage)
                .replace(/\|/ug, '\\|')
                .replace(/\n/ug, '')
                .replace(/<\/?p>/ug, '')
              : usage
            ).replace(/\n/ug, '<br>')}`
          }`,
          cooldown.toString()
        ]
      )]

  const newReadme = (await readFile(readme)).toString()
    .replace(/(?<=## Documentation\n\n)[\s\S]+(?=\n\n## Links)/u, table(docs, {alignDelimiters: false}))
    .replace(/(?<=permissions=)\d+/u, new Permissions(permissions).bitfield.toString())

  await writeFile(readme, newReadme)

  await mkdir(resolve('dist/assets/html'), {recursive: true})
  const template = (await readFile(resolve('scripts/template.html'))).toString()

  const htmlMarkdownIt = new MarkdownIt({html: true})
  const writeHtml = async (p: string, title: string, description: string, md: string): Promise<void> =>
    writeFile(resolve(`dist/assets/html/${p}.html`), template
      .replace('[title]', title)
      .replace('[description]', description)
      .replace('[content]', htmlMarkdownIt.render(md)))

  const writeOtherPage = async (htmlPath: string, mdPath: string): Promise<void> => {
    const title = upperFirst(htmlPath)
    return writeHtml(
      htmlPath,
      `${title} - Comrade Pingu`,
      `${title} for Comrade Pingu`,
      `${(await readFile(resolve(mdPath))).toString()}
#### [\u2190 back](/)`
    )
  }

  // Update index.html
  await writeHtml('index', 'Comrade Pingu', 'Kill all the capitalist scum!', newReadme
    // Replace the escaped pipe in play but not in volume
    .replace('\\|', '|')
    .replace(/\.\/assets\/img/ug, '')
    .replace('LICENSE', 'license')
    .replace('CHANGELOG.md', 'changelog'))
  // Update license.html and changelog.html
  await writeOtherPage('license', 'LICENSE')
  await writeOtherPage('changelog', 'CHANGELOG.md')
})().catch(exit)