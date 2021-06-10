import type * as url from 'url'

declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention -- global augmentation
  let URL: typeof url.URL
}
