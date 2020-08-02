declare module '@semantic-release/github' {
  type Many<T> = import('lodash').Many<T>

  export interface PluginConfig {
    githubUrl?: string
    githubApiPathPrefix?: string
    proxy?:
      | string
      | {
          host: string
          port: string
          secureProxy?: boolean
          headers?: Record<string, string>
        }
    assets?: Many<string | {path: string; name?: string; label?: string}>
    successComment?: string
    failComment?: string
    failTitle?: string
    labels?: Many<string> | false
    assignees?: Many<string>
    releasedLabels?: Many<string> | false
  }
}

declare module '@semantic-release/github/lib/definitions/constants' {
  export const RELEASE_NAME: string
}

declare module '@semantic-release/github/lib/add-channel' {
  const addChannelGithub: (
    pluginConfig: import('@semantic-release/github').PluginConfig,
    context: import('semantic-release').Context
  ) => Promise<{url: string; name: string}>
  export = addChannelGithub
}

declare module '@semantic-release/github/lib/fail' {
  const failGithub: (
    pluginConfig: import('@semantic-release/github').PluginConfig,
    context: import('semantic-release').Context
  ) => Promise<void>
  export = failGithub
}

declare module '@semantic-release/github/lib/get-client' {
  const getClient: ({
    githubToken,
    githubUrl,
    githubApiPathPrefix,
    proxy
  }: Pick<
    ReturnType<typeof import('@semantic-release/github/lib/resolve-config')>,
    'githubToken' | 'githubUrl' | 'githubApiPathPrefix' | 'proxy'
  >) => import('@octokit/rest').Octokit
  export = getClient
}

declare module '@semantic-release/github/lib/glob-assets' {
  type ReadonlyArrayType<
    T extends readonly any[]
  > = T extends readonly (infer U)[] ? U : never
  type Assets = NonNullable<
    ReturnType<
      typeof import('@semantic-release/github/lib/resolve-config')
    >['assets']
  >

  const globAssets: (
    {cwd}: import('semantic-release').Context,
    assets: Assets
  ) => Promise<
    (
      | import('./types').RequiredPick<
          Exclude<ReadonlyArrayType<Assets>, string>,
          'path' | 'name'
        >
      | string
    )[]
  >
  export = globAssets
}

declare module '@semantic-release/github/lib/is-prerelease' {
  const isPrerelease: ({type, main}: import('./types').Branch) => boolean
  export = isPrerelease
}

declare module '@semantic-release/github/lib/parse-github-url' {
  const parseGithubUrl: (
    repositoryUrl: string
    // eslint-disable-next-line @typescript-eslint/ban-types -- it could return {}
  ) => {owner: string; repo: string} | {}
  export = parseGithubUrl
}

declare module '@semantic-release/github/lib/resolve-config' {
  type Override<T, U> = Omit<T, keyof U> & U
  type PluginConfig = import('@semantic-release/github').PluginConfig
  type CastArray<K extends keyof PluginConfig> = Extract<
    PluginConfig[K],
    readonly any[]
  >

  const resolveConfig: (
    {
      githubUrl,
      githubApiPathPrefix,
      proxy,
      assets,
      successComment,
      failTitle,
      failComment,
      labels,
      assignees,
      releasedLabels
    }: PluginConfig,
    {env}: import('semantic-release').Context
  ) => {githubToken: string} & Override<
    PluginConfig,
    {[K in 'assets' | 'assignees']?: CastArray<K>} &
      {[K in 'labels' | 'releasedLabels']: CastArray<K> | false}
  > &
    import('./types').RequiredPick<PluginConfig, 'failTitle'>
  export = resolveConfig
}

declare module '@semantic-release/github/lib/success' {
  const successGithub: (
    pluginConfig: import('@semantic-release/github').PluginConfig,
    context: import('semantic-release').Context
  ) => Promise<void>
  export = successGithub
}

declare module '@semantic-release/github/lib/verify' {
  const verifyGithub: (
    pluginConfig: import('@semantic-release/github').PluginConfig,
    context: import('semantic-release').Context
  ) => Promise<void>
  export = verifyGithub
}
