import type { Accessor } from 'solid-js'
import type { S3 } from 'solid-three'
import { createRenderEffect, merge, omit } from 'solid-js'
import type { KeyOfOptionals } from './types'

/**********************************************************************************/
/*                                                                                */
/*                                      Guards                                    */
/*                                                                                */
/**********************************************************************************/

export const isRecord = (value: any): value is Record<string, any> =>
  !Array.isArray(value) && typeof value === 'object'

export function assertedNotNullish<T>(value: T | undefined, message?: string) {
  if (!value) {
    throw new Error(message)
  }
  return value
}

export function attempt<T>(callback: () => T) {
  try {
    return callback()
  } catch {
    return undefined
  }
}

/**********************************************************************************/
/*                                                                                */
/*                                       Misc                                     */
/*                                                                                */
/**********************************************************************************/

// Utility function to capitalize the first letter of the event type
export function capitalize<S extends string>(str: S): Capitalize<S> {
  return (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<S>
}

/* <Show/> and <For/> return signals */
export function resolve<T>(child: Accessor<T> | T, recursive = false): T {
  return typeof child !== 'function'
    ? child
    : recursive
    ? resolve((child as Accessor<T>)())
    : (child as Accessor<T>)()
}

export async function awaitMapObject<T extends object, U>(
  object: T,
  callback: (value: T[keyof T], key: keyof T) => Promise<U>,
) {
  const result = {} as {
    [TKey in keyof T]: U
  }
  for (const key in object) {
    result[key] = await callback(object[key], key)
  }
  return result
}

/**********************************************************************************/
/*                                                                                */
/*                                    Bubble Up                                   */
/*                                                                                */
/**********************************************************************************/

/**
 * Traverses up the tree from a given node to the root, executing a callback on each node.
 * @template T The type of data stored in the tree
 * @param node The starting node
 * @param callback Function to execute on each node during traversal
 * @internal
 */
export function bubbleUp<T extends { parent: any }>(
  node: T,
  callback: (node: T['parent']) => void,
) {
  let current: T | undefined = node
  while (current) {
    callback(current)
    current = 'parent' in current ? current.parent : undefined
  }
}

/**********************************************************************************/
/*                                                                                */
/*                                      Props                                     */
/*                                                                                */
/**********************************************************************************/

export function defaultProps<T, K extends KeyOfOptionals<T>>(
  props: T,
  defaults: Required<Pick<T, K>>,
) {
  return merge(defaults, props)
}

export function processProps<
  const TProps,
  const TKey extends KeyOfOptionals<TProps>,
  const TSplit extends readonly (keyof TProps)[],
>(props: TProps, defaults: Required<Pick<TProps, TKey>>, split?: TSplit) {
  const merged = defaultProps(props, defaults)
  return [merged, omit(merged, ...((split ?? []) as (keyof typeof merged)[]))] as const
}

/**********************************************************************************/
/*                                                                                */
/*                                      Hooks                                     */
/*                                                                                */
/**********************************************************************************/

export function useRef<T>(
  props: { ref?: T | ((value: S3.Meta<T>) => void) | undefined },
  value: T | Accessor<T>,
) {
  createRenderEffect(
    () => resolve(value),
    (result) => {
      if (typeof props.ref === 'function') {
        ;(props.ref as (value: S3.Meta<T>) => void)(result as S3.Meta<T>)
      } else {
        props.ref = result
      }
    },
  )
}

import type { SignalOptions } from 'solid-js'
import { createMemo, createSignal } from 'solid-js'

/**
 * Creates a writable signal from an accessor function.
 *
 * This function creates a signal that reflects the value returned by the accessor function.
 * The signal updates automatically whenever the accessor's return value changes.
 *
 * @template T - The type of the value.
 * @param accessor - A function that returns the current value.
 * @returns - A tuple containing the signal's getter and setter functions.
 *
 * @example
 * // Usage example
 * const [getValue, setValue] = createWritable(() => props.value);
 *
 * // Now getValue() will return the value of props.value, and setValue can be used to update it.
 */
export function createWritable<T>(fn: () => T, options?: SignalOptions<T>) {
  const signal = createMemo(() => createSignal(fn(), options))
  const get = () => signal()[0]()
  const set = (v: any) => signal()[1](v)
  return [get, set] as ReturnType<typeof createSignal<T>>
}
