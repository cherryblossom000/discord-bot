import addChannelGithub from '@semantic-release/github/lib/add-channel'
import failGithub from '@semantic-release/github/lib/fail'
import successGithub from '@semantic-release/github/lib/success'
import verifyChangelog from '@semantic-release/changelog/lib/verify'
import verifyGithub from '@semantic-release/github/lib/verify'
import prepareChangelog from './prepare-changelog'
import publishGithub from './publish-github'
import type {Plugin, PluginWithNextRelease, PublishPlugin} from './types'

let changelogVerified: boolean
let githubVerified: boolean

export const verifyConditions: Plugin = async (pluginConfig, context) => {
  // https://github.com/semantic-release/changelog/blob/v5.0.1/index.js#L19
  verifyChangelog(pluginConfig)
  changelogVerified = true

  // https://github.com/semantic-release/github/blob/v7.2.0/index.js#L27
  await verifyGithub(pluginConfig, context)
  githubVerified = true
}

export const prepare: PluginWithNextRelease = async (pluginConfig, context) => {
  // https://github.com/semantic-release/changelog/blob/v5.0.1/index.js#L23-L30
  if (!changelogVerified) {
    verifyChangelog(pluginConfig)
    changelogVerified = true
  }
  await prepareChangelog(pluginConfig, context)
}

// https://github.com/semantic-release/github/blob/v7.2.0/index.js#L31-L65
export const publish: PublishPlugin = async (pluginConfig, context) => {
  if (!githubVerified) {
    await verifyGithub(pluginConfig, context)
    // eslint-disable-next-line require-atomic-updates -- not a race condition
    githubVerified = true
  }
  return publishGithub(pluginConfig, context)
}

export const addChannel: PublishPlugin = async (pluginConfig, context) => {
  if (!githubVerified) {
    await verifyGithub(pluginConfig, context)
    // eslint-disable-next-line require-atomic-updates -- not a race condition
    githubVerified = true
  }
  return addChannelGithub(pluginConfig, context)
}

export const success: Plugin = async (pluginConfig, context) => {
  if (!githubVerified) {
    await verifyGithub(pluginConfig, context)
    // eslint-disable-next-line require-atomic-updates -- not a race condition
    githubVerified = true
  }
  await successGithub(pluginConfig, context)
}

export const fail: Plugin = async (pluginConfig, context) => {
  if (!githubVerified) {
    await verifyGithub(pluginConfig, context)
    // eslint-disable-next-line require-atomic-updates -- not a race condition
    githubVerified = true
  }
  await failGithub(pluginConfig, context)
}
