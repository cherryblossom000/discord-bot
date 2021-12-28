import * as fs from 'node:fs'
// TODO [@discordjs/rest@>0.2.0-canary.0]: see ./commands.ts
// eslint-disable-next-line @typescript-eslint/no-shadow -- ^
import {URL} from 'node:url'
import exitOnError from './exit-on-error.js'
import {botFolder, botDistFolder} from './folders.js'
import type {PackageJson} from 'type-fest'

exitOnError()

const {readFile, writeFile} = fs.promises

const package_ = JSON.parse(
  await readFile(new URL('package.json', botFolder), 'utf8')
) as PackageJson
delete package_.devDependencies
await writeFile(
  new URL('package.json', botDistFolder),
  `${JSON.stringify(package_, null, 2)}\n`
)
