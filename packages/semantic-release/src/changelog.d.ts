declare module '@semantic-release/changelog' {
  export interface PluginConfig {
    changelogFile?: string
    changelogTitle?: string
  }
}

declare module '@semantic-release/changelog/lib/verify' {
  const verifyChangelog: (
    pluginConfig: import('@semantic-release/changelog').PluginConfig
  ) => void
  export = verifyChangelog
}

declare module '@semantic-release/changelog/lib/resolve-config' {
  type PluginConfig = import('@semantic-release/changelog').PluginConfig

  const resolveConfig: ({
    changelogFile,
    changelogTitle
  }: PluginConfig) => import('./types').RequiredPick<
    PluginConfig,
    'changelogFile'
  >
  export = resolveConfig
}
