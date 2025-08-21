import type { Accessor } from 'solid-js'

/* <Show/> and <For/> return signals */
export function resolve<T>(child: Accessor<T> | T, recursive = false): T {
  return typeof child !== 'function'
    ? child
    : recursive
    ? resolve((child as Accessor<T>)())
    : (child as Accessor<T>)()
}
