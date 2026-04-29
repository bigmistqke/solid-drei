import type { Accessor } from 'solid-js'

export function check<
  T,
  const TAccessor extends Accessor<T> | T,
  const TValues extends TAccessor extends ((...args: any[]) => any) | undefined
    ? Exclude<ReturnType<Exclude<TAccessor, undefined>>, null | undefined | false>
    : Exclude<TAccessor, null | undefined | false>,
  const TResult,
>(accessor: TAccessor, callback: (value: TValues) => TResult): TResult | undefined

export function check<
  T,
  const TAccessor extends Accessor<T> | T,
  const TValues extends TAccessor extends ((...args: any[]) => any) | undefined
    ? Exclude<ReturnType<Exclude<TAccessor, undefined>>, null | undefined | false>
    : Exclude<TAccessor, null | undefined | false>,
  const TResult,
  const TFallbackResult,
>(
  accessor: TAccessor,
  callback: (value: TValues) => TResult,
  fallback?: () => TFallbackResult,
): TResult | TFallbackResult

export function check<
  T,
  const TAccessor extends Accessor<T> | T,
  const TValues extends TAccessor extends ((...args: any[]) => any) | undefined
    ? Exclude<ReturnType<Exclude<TAccessor, undefined>>, null | undefined | false>
    : Exclude<TAccessor, null | undefined | false>,
  const TResult,
  const TFallbackResult,
>(
  accessor: TAccessor,
  callback: (value: TValues) => TResult,
  fallback?: () => TFallbackResult,
): TResult | TFallbackResult | undefined {
  const value = typeof accessor === 'function' ? accessor() : accessor
  return value ? callback(value) : fallback ? fallback() : undefined
}
