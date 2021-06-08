// https://github.com/semantic-release/github/blob/v7.2.0/lib/publish.js#L1
import path from 'path'
import {RELEASE_NAME} from '@semantic-release/github/lib/definitions/constants'
import getClient from '@semantic-release/github/lib/get-client'
import globAssets from '@semantic-release/github/lib/glob-assets'
import isPrerelease from '@semantic-release/github/lib/is-prerelease'
import parseGithubUrl from '@semantic-release/github/lib/parse-github-url'
import resolveConfig from '@semantic-release/github/lib/resolve-config'
import _debug from 'debug'
// https://github.com/semantic-release/github/blob/v7.2.0/lib/publish.js#L2-L4
import {readFile, stat} from 'fs-extra'
import {isPlainObject, template} from 'lodash'
import mime from 'mime'
import editNotes from './edit-notes'
import type {Octokit} from '@octokit/rest'
// eslint-disable-next-line import/max-dependencies -- types
import type {PublishPlugin} from './types'

// https://github.com/semantic-release/github/blob/v7.2.0/lib/publish.js#L5
const debug = _debug('semantic-release:comrade-pingu:github')

// https://github.com/semantic-release/github/blob/v7.2.0/lib/publish.js#L13-L106
const publishGithub: PublishPlugin = async (pluginConfig, context) => {
  const {
    cwd,
    options: {repositoryUrl},
    branch,
    nextRelease: {name, gitTag, notes},
    logger
  } = context
  const {githubToken, githubUrl, githubApiPathPrefix, proxy, assets} =
    resolveConfig(pluginConfig, context)
  const {owner, repo} = parseGithubUrl(repositoryUrl) as {
    owner: string
    repo: string
  }
  const github = getClient({githubToken, githubUrl, githubApiPathPrefix, proxy})
  const release = {
    owner,
    repo,
    /* eslint-disable @typescript-eslint/naming-convention -- required */
    tag_name: gitTag,
    target_commitish: branch.name,
    /* eslint-enable @typescript-eslint/naming-convention -- required */
    name,
    body: editNotes(notes),
    prerelease: isPrerelease(branch)
  }

  debug('release object: %O', release)

  if (!assets || !assets.length) {
    const {
      data: {html_url: url, id: releaseId}
    } = await github.repos.createRelease(release)
    logger.log('Published GitHub release: %s', url)
    return {url, name: RELEASE_NAME, id: releaseId}
  }

  const draftRelease = {...release, draft: true}
  const {
    data: {upload_url: uploadUrl, id: releaseId}
  } = await github.repos.createRelease(draftRelease)

  const globbedAssets = await globAssets(context, assets)
  debug('globbed assets: %o', globAssets)

  await Promise.all(
    globbedAssets.map(async asset => {
      // eslint-disable-next-line @typescript-eslint/ban-types -- checking for an object
      const filePath = (isPlainObject as (value?: unknown) => value is object)(
        asset
      )
        ? asset.path
        : asset
      let file

      try {
        file = await stat(path.resolve(cwd, filePath))
      } catch {
        logger.error(
          'The asset %s cannot be read, and will be ignored.',
          filePath
        )
        return
      }

      if (!file.isFile()) {
        logger.error(
          'The asset %s is not a file, and will be ignored.',
          filePath
        )
        return
      }

      const fileName = template(
        typeof asset === 'string' ? path.basename(filePath) : asset.name
      )(context)
      const upload = {
        url: uploadUrl,
        data: await readFile(path.resolve(cwd, filePath)),
        name: fileName,
        headers: {
          'content-type': mime.getType(path.extname(fileName)) ?? 'text/plain',
          'content-length': file.size
        }
      } as unknown as NonNullable<
        Parameters<Octokit['repos']['uploadReleaseAsset']>[0]
      >

      debug('file path: %o', filePath)
      debug('file name: %o', fileName)

      if (
        // eslint-disable-next-line @typescript-eslint/ban-types -- checking for an object
        (isPlainObject as (value?: unknown) => value is object)(asset) &&
        asset.label !== undefined &&
        asset.label !== ''
      )
        upload.label = template(asset.label)(context)

      const {
        data: {browser_download_url: downloadUrl}
      } = await github.repos.uploadReleaseAsset(upload)
      logger.log('Published file %s', downloadUrl)
    })
  )

  const {
    data: {html_url: url}
  } = await github.repos.updateRelease({
    owner,
    repo,
    // eslint-disable-next-line @typescript-eslint/naming-convention -- required
    release_id: releaseId,
    draft: false
  })

  logger.log('Published GitHub release %s', url)
  return {url, name: RELEASE_NAME, id: releaseId}
}
export default publishGithub
