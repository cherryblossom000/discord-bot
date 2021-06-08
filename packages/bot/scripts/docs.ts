import fs from 'fs'
import path from 'path'
import {Permissions} from 'discord.js'
import MarkdownIt from 'markdown-it'
import {markdownTable} from 'markdown-table'
import exitOnError, {exit} from '../../../scripts/exit-on-error'
import {permissions} from '../src/constants'
import {upperFirst} from '../src/lodash'
import type {Command} from '../src/types'

exitOnError()

const {mkdir, readFile, readdir, writeFile} = fs.promises
const resolve = (...paths: string[]): string => path.join(__dirname, ...paths)

const rootFolder = path.dirname(__dirname)
const dist = path.join(rootFolder, 'dist')
const commandsFolder = path.join(dist, 'src', 'commands')
const htmlFolder = path.join(dist, 'assets', 'html')
const readme = path.join(rootFolder, 'README.md')

;(async (): Promise<void> => {
  // Update readme
  const files = await readdir(commandsFolder)
  const modules = await Promise.all(
    files
      .filter(f => f.endsWith('.js'))
      .map<Promise<unknown>>(async f => import(path.join(commandsFolder, f)))
  )
  const commands = modules.map(m => (m as {default: Command}).default)
  const usageMarkdownIt = new MarkdownIt({html: true, breaks: true})
  const docs = [
    ['Command', 'Aliases', 'Description', 'Usage', 'Cooldown (s)'],
    ...commands
      .filter(({hidden = false}) => !hidden)
      .map(({name, aliases, description, syntax, usage, cooldown = 3}) => [
        `\`${name}\``,
        aliases?.map(a => `\`${a}\``).join(', ') ?? '-',
        name === 'iwmelc'
          ? `${description}<br>![i will murder every last capitalist](./assets/img/iwmelc.jpg)`
          : name === 'htkb'
          ? `${description}<br>![how to kiss boy](./assets/img/htkb.jpg)`
          : description,
        `\`.${name}${
          syntax === undefined ? '' : ` ${syntax.replace(/\|/gu, '\\|')}`
        }\`${
          usage === undefined
            ? ''
            : `<br>${(name === 'play' || name === 'volume'
                ? usageMarkdownIt
                    .render(usage)
                    .replace(/\|/gu, '\\|')
                    .replace(/\n/gu, '')
                    .replace(/<\/?p>/gu, '')
                : usage
              ).replace(/\n/gu, '<br>')}`
        }`,
        cooldown.toString()
      ])
  ]

  const newReadme = (await readFile(readme))
    .toString()
    .replace(
      /(?<=## Documentation\n\n)[\s\S]+(?=\n\n## Links)/u,
      markdownTable(docs, {alignDelimiters: false})
    )
    .replace(
      /(?<=permissions=)\d+/u,
      new Permissions(permissions).bitfield.toString()
    )

  await writeFile(readme, newReadme)

  await mkdir(htmlFolder, {recursive: true})
  const template = (await readFile(resolve('template.html'))).toString()

  const htmlMarkdownIt = new MarkdownIt({html: true})
  const writeHtml = async (
    p: string,
    title: string,
    description: string,
    _path: string,
    md: string
  ): Promise<void> =>
    writeFile(
      path.join(htmlFolder, `${p}.html`),
      template
        .replace(/\[title\]/gu, title)
        .replace(/\[description\]/gu, description)
        .replace('[path]', _path)
        .replace('[content]', htmlMarkdownIt.render(md))
    )

  const writeOtherPage = async (
    htmlPath: string,
    mdPath: string
  ): Promise<void> => {
    const title = upperFirst(htmlPath)
    return writeHtml(
      htmlPath,
      `${title} - Comrade Pingu`,
      `${title} for Comrade Pingu`,
      `/${htmlPath}`,
      `${(await readFile(path.join(rootFolder, mdPath))).toString()}
#### [← back](/)`
    )
  }

  // Update index.html
  await writeHtml(
    'index',
    'Comrade Pingu',
    'Kill all the capitalist scum!',
    '',
    newReadme
      // Replace the escaped pipe in play but not in volume
      .replace('\\|', '|')
      .replace(/\.\/assets\/img/gu, '')
      .replace('LICENSE', 'license')
      .replace('CHANGELOG.md', 'changelog')
  )
  // Update license.html and changelog.html
  await writeOtherPage('license', path.join('..', '..', 'LICENSE'))
  await writeOtherPage('changelog', 'CHANGELOG.md')
})().catch(exit)
