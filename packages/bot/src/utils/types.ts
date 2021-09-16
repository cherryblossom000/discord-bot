export type NonEmpty<T> = [T, ...T[]]
export type ReadonlyNonEmpty<T> = Readonly<NonEmpty<T>>

export type KeysMatching<T, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never
}[keyof T]

export type RequireKeys<T, K extends keyof T> = Required<Pick<T, K>> & T

export type Override<T, U> = Omit<T, keyof U> & U
