import fs, {readdirSync} from 'fs'
import {join} from 'path'
import {promisify} from 'util'
import MarkdownIt from 'markdown-it'
import table from 'markdown-table'
import type {PinguCommand} from '../src/types'

const path = (p: string): string => join(__dirname, p)
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

const template = (title: string, description: string, content: string): string => `<!DOCTYPE html>
<html>
  <head>
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link id="favicon" rel="icon" href="/pingu.jpg" type="image/x-icon">
    <style>body {padding: 1em}</style>
    <link href="/github-markdown.css" rel="stylesheet">
    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=UA-137716576-3"></script>
    <script>
      window.dataLayer=window.dataLayer||[]
      function gtag(){dataLayer.push(arguments)}
      gtag('js',new Date)
      gtag('config','UA-137716576-3')
    </script>
  </head>
  <body class="markdown-body">${content}</body>
</html>`

const commandsPath = path('../dist/src/commands')
const readmePath = path('../README.md')

const writeHtml = async (p: string, title: string, description: string, md: string): Promise<void> =>
  writeFile(path(`../dist/assets/html/${p}.html`), template(title, description, new MarkdownIt({html: true}).render(md)))

;(async (): Promise<void> => {
  const readme = readFile(readmePath)
  const license = readFile(path('../LICENSE'))
  const changelog = readFile(path('../CHANGELOG.md'))

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
  const promises = [
    writeFile(readmePath, newReadme),

    // update index.html
    writeHtml('index', 'Comrade Pingu', 'Kill all the capitalist scum!', newReadme
      .replace('./assets/img', '')
      .replace('LICENSE', 'license')
      .replace('CHANGELOG.md', 'changelog')
    ),

    // update license.html
    writeHtml('license', 'License - Comrade Pingu', 'License for Comrade Pingu', (await license).toString()),

    // update changelog.html
    writeHtml('changelog', 'Changelog - Comrade Pingu', 'Changelog for Comrade Pingu', (await changelog).toString())
  ]

  await Promise.all(promises)
})()
