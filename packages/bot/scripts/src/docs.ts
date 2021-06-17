import fs from 'fs'
import path from 'path'
import {fileURLToPath} from 'url'
import {Permissions} from 'discord.js'
import MarkdownIt from 'markdown-it'
import {markdownTable} from 'markdown-table'
import exitOnError, {exit} from '../../../../scripts/dist/exit-on-error.js'
// TODO: fix this
// @ts-ignore CommonJS module, default export is the module.exports
import _constants from '../../dist/src/constants.js'
// @ts-ignore see ^^
import _lodash from '../../dist/src/lodash.js'
import type * as constants from '../../src/constants'
import type * as lodash from '../../src/lodash'
import type {Command} from '../../src/types'
// eslint-disable-next-line import/max-dependencies -- due to hack for TS
import type {} from '../../../../scripts/src/url'

exitOnError()

const {defaultPrefix, permissions} = _constants as typeof constants
const {upperFirst} = _lodash as typeof lodash

const {mkdir, readdir, writeFile} = fs.promises

const readFile = async (
  path_: fs.PathLike | fs.promises.FileHandle
): Promise<string> => fs.promises.readFile(path_, 'utf8')

const scriptsFolder = new URL('..', import.meta.url)
const rootFolder = new URL('..', scriptsFolder)
const distFolder = new URL('dist/', rootFolder)
const commandsFolder = new URL('src/commands/', distFolder)
const htmlFolder = new URL('assets/html/', distFolder)
const readmeFile = new URL('README.md', rootFolder)

// Import commands
readdir(commandsFolder)
  .then(async files => {
    const commands = await Promise.all(
      files
        .filter(f => f.endsWith('.js'))
        .map(
          async f =>
            (
              await (import(
                fileURLToPath(new URL(f, commandsFolder))
              ) as Promise<{
                default: {default: Command}
              }>)
            ).default.default
        )
    )

    // Commands docs for markdown-table
    const usageMarkdownIt = new MarkdownIt({
      html: true,
      breaks: true,
      linkify: true
    })
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
          `\`${defaultPrefix}${name}${
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

    const [newReadme, template] = await Promise.all([
      // Replace old readme docs
      // eslint-disable-next-line promise/no-nesting -- promise not awaited value
      readFile(readmeFile).then(s =>
        s
          .replace(
            /(?<=<!-- DOCS START -->\n\n)[\s\S]*(?=\n\n<!-- DOCS END -->)/u,
            markdownTable(docs, {alignDelimiters: false})
          )
          .replace(
            /(?<=permissions=)\d+/u,
            new Permissions(permissions).bitfield.toString()
          )
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
          .replace(/\[title\]/gu, title)
          .replace(/\[description\]/gu, description)
          .replace('[path]', path_)
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
        `${await readFile(new URL(mdPath, rootFolder))}
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
          .replace(/\.\/assets\/img/gu, '')
          .replace('LICENSE', 'license')
          .replace('CHANGELOG.md', 'changelog')
      ),
      // Update license.html and changelog.html
      writeOtherPage('license', path.join('..', '..', 'LICENSE')),
      writeOtherPage('changelog', 'CHANGELOG.md')
    ])
  })
  .catch(exit)
