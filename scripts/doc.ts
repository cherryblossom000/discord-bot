import {promises, readdirSync} from 'fs'
import {join, resolve} from 'path'
import MarkdownIt from 'markdown-it'
import {Permissions} from 'discord.js'
import table from 'markdown-table'
import upperFirst from 'lodash.upperfirst'
import {permissions} from '../src/constants'
import type {Command} from '../src/types'

const {mkdir, readFile, writeFile} = promises

const commandsPath = resolve('dist/src/commands')
const readme = resolve('README.md')

;(async (): Promise<void> => {
  // update readme
  const files = readdirSync(commandsPath)
  const modules = await Promise.all(files
    .filter(f => !f.endsWith('.map'))
    .map(async f => import(join(commandsPath, f)))
  )
  const commands = modules.map<Command>(m => m.default)
  const usageMarkdownIt = new MarkdownIt({html: true, breaks: true})
  const docs = [['Command', 'Aliases', 'Description', 'Usage', 'Cooldown (s)'],
    ...commands.map(
      ({name, aliases, description, syntax, usage, cooldown = 3}) => [
          `\`${name}\``,
          aliases?.map(a => `\`${a}\``).join(', ') ?? '-',
          name === 'iwmelc'
            ? `${description}<br>![i will murder every last capitalist](./assets/img/iwmelc.jpg)`
            : description,
          `\`.${name}${syntax ? ` ${syntax.replace(/\|/g, '\\|')}` : ''}\`${usage
              ? `<br>${(name === 'play' || name === 'volume'
                ? usageMarkdownIt.render(usage)
                  .replace(/\|/g, '\\|')
                  .replace(/\n/g, '')
                  .replace(/<\/?p>/g, '')
                : usage
              ).replace(/\n/g, '<br>')}`
              : ''
          }`,
          cooldown.toString()
      ]
    )]

  const newReadme = (await readFile(readme)).toString()
    .replace(/(?<=## Documentation\n)[\s\S]+(?=\n\n## Links)/, table(docs, {alignDelimiters: false}))
    .replace(/(?<=permissions=)\d+/, new Permissions(permissions).bitfield.toString())

  await mkdir(resolve('dist/assets/html'), {recursive: true})
  const template = (await readFile(resolve('scripts/template.html'))).toString()

  const htmlMarkdownIt = new MarkdownIt({html: true})
  const writeHtml = async (p: string, title: string, description: string, md: string): Promise<void> =>
    writeFile(resolve(`dist/assets/html/${p}.html`), template
      .replace('[title]', title)
      .replace('[description]', description)
      .replace('[content]', htmlMarkdownIt.render(md))
    )

  const writeOtherPage = async (htmlPath: string, mdPath: string): Promise<void> => {
    const title = upperFirst(htmlPath)
    return writeHtml(
      htmlPath,
      `${title} - Comrade Pingu`, `${title} for Comrade Pingu`,
    `${(await readFile(resolve(mdPath))).toString()}
#### [\u2190 back](/)`
    )
  }

  // update index.html
  await writeHtml('index', 'Comrade Pingu', 'Kill all the capitalist scum!', newReadme
    // replace the escaped pipe in play but not in volume
    .replace('\\|', '|')
    .replace('./assets/img', '')
    .replace('LICENSE', 'license')
    .replace('CHANGELOG.md', 'changelog')
  )
  // update license.html and changelog.html
  await writeOtherPage('license', 'LICENSE')
  await writeOtherPage('changelog', 'CHANGELOG.md')
})()
