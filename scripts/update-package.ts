import {join} from 'path'
import {readFileSync, writeFileSync} from 'fs'
import type {PackageJson} from 'type-fest'

const botFolder = join(__dirname, '..', 'packages', 'bot')
const package_ = JSON.parse(
  readFileSync(join(botFolder, 'package.json'), 'utf8')
) as PackageJson
delete package_.devDependencies
writeFileSync(
  join(botFolder, 'dist', 'package.json'),
  `${JSON.stringify(package_, null, 2)}\n`
)
