import {promises} from 'fs'
import {join} from 'path'
import type {Context} from 'semantic-release'
import type {PackageJson} from 'type-fest'

const {readFile, writeFile} = promises

const preparePackage = async ({cwd}: Context): Promise<void> => {
  const packagePath = join(cwd, 'package.json')
  const string = await readFile(packagePath, 'utf8')
  const manifest = JSON.parse(string) as PackageJson
  ;([
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies'
  ] as const).forEach(key => {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- need to remove property
    if (!Object.keys(manifest[key]!).length) delete manifest[key]
  })
  await writeFile(
    packagePath,
    `${JSON.stringify(manifest, null, /\n([^"]+)/u.exec(string)?.[1] ?? 2)}\n`
  )
}
export default preparePackage
