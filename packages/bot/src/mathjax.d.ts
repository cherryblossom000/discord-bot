declare module 'mathjax' {
  import type {LiteAdaptor} from 'mathjax-full/js/adaptors/liteAdaptor'
  import type {LiteElement} from 'mathjax-full/js/adaptors/lite/Element'
  import type * as Loader from 'mathjax-full/js/components/loader'
  import type * as Startup from 'mathjax-full/js/components/startup'

  export interface MathJax extends Loader.MathJaxObject, Startup.MathJaxObject {
    startup: {
      adaptor: LiteAdaptor
    }
    tex2svg: (math: string, options: OptionList = {}) => LiteElement
  }

  // #region Config
  interface Location<N, T> {
    i?: number
    n?: number
    delim?: string
    node?: N | T
  }

  interface ProtoItem<N, T> {
    math: string
    start: Location<N, T>
    end: Location<N, T>
    open?: string
    close?: string
    n?: number
    display: boolean
  }

  interface FindMath<N, T, D> {
    findMath(node: N): ProtoItem<N, T>[]
    findMath(strings: string[]): ProtoItem<N, T>[]
  }

  abstract class AbstractFindMath<N, T, D> implements FindMath<N, T, D> {
    static OPTIONS: OptionList
    protected options: OptionList
    constructor(options: OptionList)
    abstract findMath(where: N | string[]): ProtoItem<N, T>[]
  }

  type EndItem = [string, boolean, RegExp]
  type Delims = [string, string]

  class FindTeX<N, T, D> extends AbstractFindMath<N, T, D> {
    static OPTIONS: OptionList
    protected start: RegExp
    protected end: Record<string, EndItem>
    protected hasPatterns: boolean
    protected env: number
    protected sub: number
    constructor(options: OptionList)
    findMath(strings: string[]): ProtoItem<N, T>[]
    protected getPatterns()
    protected addPattern(starts: string[], delims: Delims, display: boolean)
    protected endPattern(end: string): RegExp
    protected findEnd(
      text: string,
      n: number,
      start: RegExpExecArray,
      end: EndItem
    ): ProtoItem | null
    protected findMathInString(math: ProtoItem<N, T>[], n: number, text: string)
  }

  class PackageError extends Error {
    package: string
    constructor(message: string, name: string)
  }

  type Components = '[tex]/ams' | 'input/tex-base' | 'output/svg'

  interface LoaderOptions<T extends Components = Components>
    extends NonNullable<Loader.MathJaxConfig['loader']> {
    [component: T]: {
      ready?: (name: string) => void
      failed?: (error: PackageError) => void
      checkReady?: () => void
    }
    load?: T[]
  }

  interface OutputOptions {
    scale?: number
    minScale?: number
    mtextInheritFont?: boolean
    merrorInheritFont?: boolean
    mathmlSpacing?: boolean
    skipAttributes?: Record<string, boolean>
    exFactor?: string
    displayAlign?: 'auto' | 'center'
    displayIndent?: 'auto' | (string & {_?: never})
  }

  type TeXPackages = 'ams' | 'base'

  interface Config<T extends Components = Components>
    extends MathJaxConfig,
      Loader.MathJaxConfig,
      Startup.MathJaxConfig {
    loader?: LoaderOptions<T>
    tex?: T extends 'input/tex-base'
      ? {
          packages?: TeXPackages[] | {'[+]'?: TeXPackages[]}
          inlineMath?: [string, string][]
          displayMath?: [string, string][]
          processEscapes?: boolean
          processEnvironments?: boolean
          processRefs?: boolean
          digits?: RegExp
          tags?: 'all' | 'ams' | 'none'
          tagSide?: 'left' | 'right'
          tagIndent?: string
          useLabelIds?: boolean
          multilineWidth?: string
          maxMacros?: number
          maxBuffer?: number
          baseURL?: string
          FindTeX?: FindTeX | null
        }
      : never
    svg?: T extends 'output/svg'
      ? OutputOptions & {
          fontCache?: 'global' | 'local' | 'none'
          internalSpeechTitles?: boolean
          localID?: string | null
          titleID?: number
        }
      : never
  }
  // #endregion

  export const init: <T extends Components>(
    config?: Config<T>
  ) => Promise<MathJax>
}
