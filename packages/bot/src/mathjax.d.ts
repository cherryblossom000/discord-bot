declare module 'mathjax' {
  import type {LiteAdaptor} from 'mathjax-full/js/adaptors/liteAdaptor'
  import type {LiteElement} from 'mathjax-full/js/adaptors/lite/Element'
  import type * as Loader from 'mathjax-full/js/components/loader'
  import type * as Startup from 'mathjax-full/js/components/startup'
  import type {OptionList} from 'mathjax-full/js/util/Options'

  type MathJaxBase = Loader.MathJaxObject & Startup.MathJaxObject
  export interface MathJax extends MathJaxBase {
    startup: Omit<Startup.MathJaxObject['startup'], 'adaptor'> & {
      adaptor: LiteAdaptor
    }
    tex2svg: (math: string, options?: OptionList) => LiteElement
  }

  type Components = '[tex]/ams' | 'input/tex-base' | 'output/svg'

  interface LoaderOptions<T extends Components = Components>
    extends NonNullable<Loader.MathJaxConfig['loader']> {
    load?: T[]
  }

  type TeXPackages = 'ams' | 'base'

  interface Config<T extends Components = Components>
    extends Loader.MathJaxConfig,
      Startup.MathJaxConfig {
    loader?: LoaderOptions<T>
    tex?: T extends 'input/tex-base'
      ? {packages?: TeXPackages[] | {'[+]'?: TeXPackages[]}}
      : never
    svg?: T extends 'output/svg' ? {internalSpeechTitles?: boolean} : never
  }

  export const init: <T extends Components>(
    config?: Config<T>
  ) => Promise<MathJax>
}
