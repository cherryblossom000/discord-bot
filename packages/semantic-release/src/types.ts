import type Changelog from '@semantic-release/changelog'
import type Github from '@semantic-release/github'
import type {BranchSpec, Context} from 'semantic-release'

type Promisable<T> = T | Promise<T>
// eslint-disable-next-line import/no-unused-modules -- it is used
export type RequiredPick<T, K extends keyof T> = T & Required<Pick<T, K>>

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
        type: 'release'
        range: string
        accept: string[]
        main: boolean
      }
    | {
        type: 'prerelease'
        prerelease: string
      }
  )

declare module 'semantic-release' {
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

// eslint-disable-next-line import/no-unused-modules -- it is used
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
