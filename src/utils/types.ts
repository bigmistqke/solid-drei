import type { Accessor } from 'solid-js'

export type Args<T> = T extends new (...args: any) => any ? ConstructorParameters<T> : T

export type Mandatory<T, K extends keyof T> = T & { [P in K]-?: T[P] }

export type Overwrite<T extends unknown[]> = T extends [infer First, ...infer Rest]
  ? Rest extends []
    ? First
    : Overwrite<Rest> extends infer Result
    ? Omit<First, keyof Result> & Result
    : never
  : never

export type KeyOfOptionals<T> = keyof {
  [K in keyof T as T extends Record<K, T[K]> ? never : K]: T[K]
}

/** Allows using a TS v4 labeled tuple even with older typescript versions */
export type NamedArrayTuple<T extends (...args: any) => any> = Parameters<T>

export type Ref<TRef> = TRef | ((value: TRef) => void)

export type WidenBooleans<T> = {
  [K in keyof T]: T[K] extends false | true ? boolean : T[K]
}

export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type Intersect<T extends any[]> = T extends [infer U, ...infer Rest]
  ? Rest['length'] extends 0
    ? U
    : U & Intersect<Rest>
  : T

export type AccessorMaybe<T> = T | Accessor<T>
export type Resolve<T> = T extends (...args: any[]) => infer U ? U : T
