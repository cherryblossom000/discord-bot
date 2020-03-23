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
  const docs = [['Command', 'Aliases', 'Description', 'Usage', 'Cooldown (s)']]
    .concat(commands.map(
      ({name, aliases, description, syntax, usage, cooldown = 3}) => [
          `\`${name}\``,
          aliases?.map(a => `\`${a}\``).join(', ') ?? '-',
          name === 'iwmelc'
            ? `${description}<br>![i will murder every last capitalist](./assets/img/iwmelc.jpg)`
            : description,
          `\`.${name}${syntax ? ` ${syntax}` : ''}\`${usage ? `<br>${usage.replace(/\n/g, '<br>')}` : ''}`,
          cooldown.toString()
      ]
    ))

  const newReadme = (await readFile(readme)).toString()
    .replace(/(?<=## Documentation\n)[\s\S]+(?=\n\n## Links)/, table(docs))
    .replace(/(?<=permissions=)\d+/, new Permissions(permissions).bitfield.toString())

  await mkdir(resolve('dist/assets/html'), {recursive: true})
  const template = (await readFile(resolve('scripts/template.html'))).toString()

  const writeHtml = async (p: string, title: string, description: string, md: string): Promise<void> =>
    writeFile(resolve(`dist/assets/html/${p}.html`), template
      .replace('[title]', title)
      .replace('[description]', description)
      .replace('[content]', new MarkdownIt({html: true}).render(md))
    )

  const writeOtherPage = async (htmlPath: string, mdPath: string): Promise<void> => {
    const P = upperFirst(htmlPath)
    return writeHtml(
      htmlPath,
      `${P} - Comrade Pingu`, `${P} for Comrade Pingu`,
    `${(await readFile(resolve(mdPath))).toString()}
#### [\u2190 back](/)`
    )
  }

  await writeFile(readme, newReadme)
  // update index.html
  await writeHtml('index', 'Comrade Pingu', 'Kill all the capitalist scum!', newReadme
    .replace('./assets/img', '')
    .replace('LICENSE', 'license')
    .replace('CHANGELOG.md', 'changelog')
  )
  // update license.html and changelog.html
  await writeOtherPage('license', 'LICENSE')
  await writeOtherPage('changelog', 'CHANGELOG.md')
})()
