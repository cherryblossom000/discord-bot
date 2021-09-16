import * as fs from 'fs'
import exitOnError from './exit-on-error.js'
import type {PackageJson} from 'type-fest'

exitOnError()

const {readFile, writeFile} = fs.promises

const botFolder = new URL('../../packages/bot/', import.meta.url)
const package_ = JSON.parse(
  await readFile(new URL('package.json', botFolder), 'utf8')
) as PackageJson
delete package_.devDependencies
await writeFile(
  new URL('dist/package.json', botFolder),
  `${JSON.stringify(package_, null, 2)}\n`
)
