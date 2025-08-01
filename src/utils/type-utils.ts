export type Args<T> = T extends new (...args: any) => any ? ConstructorParameters<T> : T

export type Mandatory<T, K extends keyof T> = T & { [P in K]-?: T[P] }

type OmitFunctionProperties<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T]
/** Overwrites the properties in `T` with the properties from `O`. */
export type Overwrite<T, O> = Omit<T, OmitFunctionProperties<O>> & O

export type KeyOfOptionals<T> = keyof {
  [K in keyof T as T extends Record<K, T[K]> ? never : K]: T[K]
}

/** Allows using a TS v4 labeled tuple even with older typescript versions */
export type NamedArrayTuple<T extends (...args: any) => any> = Parameters<T>

export type Ref<TRef> = TRef | ((value: TRef) => void)
