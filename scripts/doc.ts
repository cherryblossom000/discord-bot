import {promises, readdirSync} from 'fs'
import {join} from 'path'
import MarkdownIt from 'markdown-it'
import table from 'markdown-table'
import upperFirst from 'lodash.upperfirst'
import {createResolve} from '../src/helpers'
import type {PinguCommand} from '../src/types'

const {mkdir, readFile, writeFile} = promises
const resolve = createResolve(__dirname)

const commandsPath = resolve('../dist/src/commands')
const readmePath = resolve('../README.md')

;(async (): Promise<void> => {
  const readme = readFile(readmePath)
  const mkdirPromise = mkdir(resolve('../dist/assets/html'), {recursive: true})
  const templatePromise = readFile(resolve('template.html'))
  const license = readFile(resolve('../LICENSE'))
  const changelog = readFile(resolve('../CHANGELOG.md'))

  // update readme
  const files = readdirSync(commandsPath)
  const modules = await Promise.all(files
    .filter(f => !f.endsWith('.map'))
    .map(async f => import(join(commandsPath, f)))
  )
  const commands = modules.map<PinguCommand>(m => m.default)
  const docs = [['Command', 'Aliases', 'Description', 'Usage', 'Cooldown (s)']]
    .concat(commands.map(
      ({name, aliases, description, syntax, usage, cooldown = 3}) => [
          `\`${name}\``,
          aliases?.map(a => `\`${a}\``).join(', ') ?? '-',
          name === 'iwmelc' ? `${description}![i will murder every last capitalist](./assets/img/iwmelc.jpg)` : description,
          `\`.${name}${syntax ? ` ${syntax}` : ''}\`${usage ? `<br>${usage.replace(/\n/g, '<br>')}` : ''}`,
          cooldown.toString()
      ]
    ))
  const newReadme = (await readme).toString().replace(/(?<=## Documentation\n)[\s\S]+(?=\n\n## Links)/, table(docs))
  const promises = [writeFile(readmePath, newReadme)]

  await mkdirPromise
  const template = (await templatePromise).toString()
  const writeHtml = async (p: string, title: string, description: string, md: string): Promise<void> =>
    writeFile(resolve(`../dist/assets/html/${p}.html`), template
      .replace('[title]', title)
      .replace('[description]', description)
      .replace('[content]', new MarkdownIt({html: true}).render(md))
    )
  const writeOtherPage = async (p: string, md: Promise<Buffer>): Promise<void> => {
    const P = upperFirst(p)
    return writeHtml(p, `${P} - Comrade Pingu`, `${P} for Comrade Pingu`, `${(await md).toString()}
#### [\u2190 back](/)`)
  }

  promises.push(...[
    // update index.html
    writeHtml('index', 'Comrade Pingu', 'Kill all the capitalist scum!', newReadme
      .replace('./assets/img', '')
      .replace('LICENSE', 'license')
      .replace('CHANGELOG.md', 'changelog')
    ),

    // update license.html and changelog.html
    writeOtherPage('license', license),
    // update changelog.html
    writeOtherPage('changelog', changelog)
  ])

  await Promise.all(promises)
})()
