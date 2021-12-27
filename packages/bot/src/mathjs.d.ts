declare module 'mathjs' {
  export const evaluate: math.MathJsStatic['evaluate']
  export const simplify: math.MathJsStatic['simplify']
  export class ResultSet<T> {
    // TODO: fix this bug
    // eslint-disable-next-line @typescript-eslint/no-shadow -- not shadowing
    static fromJSON: <T>(json: {entries?: readonly T[]}) => ResultSet<T>
    entries: T[]
    type: 'ResultSet'
    isResultSet: true
    constructor(entries?: readonly T[])
    valueOf(): T[]
    toString(): string
    toJSON(): {mathjs: 'ResultSet'; entries: T[]}
  }
}
