declare module '@semantic-release/changelog' {
	export interface PluginConfig {
		changelogFile?: string
		changelogTitle?: string
	}
}

declare module '@semantic-release/changelog/lib/verify' {
	import type {PluginConfig} from '@semantic-release/changelog'

	const verifyChangelog: (pluginConfig: PluginConfig) => void
	export = verifyChangelog
}

declare module '@semantic-release/changelog/lib/resolve-config' {
	import type {PluginConfig} from '@semantic-release/changelog'

	type RequiredPick<T, K extends keyof T> = import('./types').RequiredPick<T, K>

	const resolveConfig: ({
		changelogFile,
		changelogTitle
	}: PluginConfig) => RequiredPick<PluginConfig, 'changelogFile'>
	export = resolveConfig
}
