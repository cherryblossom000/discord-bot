import type Changelog from '@semantic-release/changelog'
import type Github from '@semantic-release/github'
import type {BranchSpec, Context} from 'semantic-release'

type Promisable<T> = Promise<T> | T
// eslint-disable-next-line import/no-unused-modules -- it is used
export type RequiredPick<T, K extends keyof T> = Required<Pick<T, K>> & T

// eslint-disable-next-line import/no-unused-modules -- it is used
export type Branch = Exclude<BranchSpec, string> & {
  tags: {gitTag: string; version: string; channels: string[] | [null]}[]
  channel: string
} & (
    | {
        type: 'maintenance'
        range: string
        accept: string[]
        mergeRange: string
      }
    | {
        type: 'prerelease'
        prerelease: string
      }
    | {
        type: 'release'
        range: string
        accept: string[]
        main: boolean
      }
  )

declare module 'semantic-release' {
  // eslint-disable-next-line @typescript-eslint/no-shadow -- module augmentation
  interface Context {
    cwd: string
    branch: Branch
  }

  interface GlobalConfig {
    repositoryUrl: string
  }

  interface NextRelease {
    name: string
  }
}

interface PluginConfig extends Changelog.PluginConfig, Github.PluginConfig {}

export type Plugin = (
  pluginConfig: PluginConfig,
  context: Context
) => Promisable<void>

type ContextWithNextRelease = RequiredPick<Context, 'nextRelease' | 'options'>

export type PluginWithNextRelease = (
  pluginConfig: PluginConfig,
  context: ContextWithNextRelease
) => Promisable<void>

export type PublishPlugin = (
  pluginConfig: PluginConfig,
  context: ContextWithNextRelease
) => Promisable<{url: string; name: string}>
