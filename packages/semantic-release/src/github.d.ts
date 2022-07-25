declare module '@semantic-release/github' {
	import type {Many} from 'lodash'

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
	import type {PluginConfig} from '@semantic-release/github'
	import type {Context} from 'semantic-release'

	const addChannelGithub: (
		pluginConfig: PluginConfig,
		context: Context
	) => Promise<{url: string; name: string}>
	export = addChannelGithub
}

declare module '@semantic-release/github/lib/fail' {
	import type {PluginConfig} from '@semantic-release/github'
	import type {Context} from 'semantic-release'

	const failGithub: (
		pluginConfig: PluginConfig,
		context: Context
	) => Promise<void>
	export = failGithub
}

declare module '@semantic-release/github/lib/get-client' {
	import type {Octokit} from '@octokit/rest'
	import type resolveConfig from '@semantic-release/github/lib/resolve-config'

	const getClient: ({
		githubToken,
		githubUrl,
		githubApiPathPrefix,
		proxy
	}: Pick<
		ReturnType<typeof resolveConfig>,
		'githubApiPathPrefix' | 'githubToken' | 'githubUrl' | 'proxy'
	>) => Octokit
	export = getClient
}

declare module '@semantic-release/github/lib/glob-assets' {
	import type resolveConfig from '@semantic-release/github/lib/resolve-config'
	import type {Context} from 'semantic-release'

	type RequiredPick<T, K extends keyof T> = import('./types').RequiredPick<T, K>

	type ArrayType<T extends readonly unknown[]> = T extends readonly (infer U)[]
		? U
		: never
	type Assets = NonNullable<ReturnType<typeof resolveConfig>['assets']>

	const globAssets: (
		{cwd}: Context,
		assets: Assets
	) => Promise<
		(
			| RequiredPick<Exclude<ArrayType<Assets>, string>, 'name' | 'path'>
			| string
		)[]
	>
	export = globAssets
}

declare module '@semantic-release/github/lib/is-prerelease' {
	import type {BranchObject} from 'semantic-release'

	const isPrerelease: (branch: BranchObject) => boolean
	export = isPrerelease
}

declare module '@semantic-release/github/lib/parse-github-url' {
	const parseGithubUrl: (
		repositoryUrl: string
		// eslint-disable-next-line @typescript-eslint/ban-types -- it could return {}
	) => {} | {owner: string; repo: string}
	export = parseGithubUrl
}

declare module '@semantic-release/github/lib/resolve-config' {
	import type {PluginConfig} from '@semantic-release/github'
	import type {Context} from 'semantic-release'

	type RequiredPick<T, K extends keyof T> = import('./types').RequiredPick<T, K>

	type Override<T, U> = Omit<T, keyof U> & U
	type CastArray<K extends keyof PluginConfig> = Extract<
		PluginConfig[K],
		readonly unknown[]
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
		{env}: Context
	) => Override<
		PluginConfig,
		{
			[K in 'labels' | 'releasedLabels']: CastArray<K> | false
		} & {[K in 'assets' | 'assignees']?: CastArray<K>}
	> &
		RequiredPick<PluginConfig, 'failTitle'> & {githubToken: string}
	export = resolveConfig
}

declare module '@semantic-release/github/lib/success' {
	import type {PluginConfig} from '@semantic-release/github'
	import type {Context} from 'semantic-release'

	const successGithub: (
		pluginConfig: PluginConfig,
		context: Context
	) => Promise<void>
	export = successGithub
}

declare module '@semantic-release/github/lib/verify' {
	import type {PluginConfig} from '@semantic-release/github'
	import type {Context} from 'semantic-release'

	const verifyGithub: (
		pluginConfig: PluginConfig,
		context: Context
	) => Promise<void>
	export = verifyGithub
}
