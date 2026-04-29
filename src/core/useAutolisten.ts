/**********************************************************************************/
/*                                                                                */
/*                                  Auto Listen                                   */
/*                                                                                */
/**********************************************************************************/

import { resolve } from '@/utils'
import type { AccessorMaybe } from '@/utils/types'
import { createRenderEffect, onCleanup } from 'solid-js'

export function useAutolisten<
  TTarget extends {
    addEventListener(...args: any[]): void
    removeEventListener(...args: any[]): void
  },
>(
  object: AccessorMaybe<TTarget>,
): TTarget['addEventListener'] &
  ((type: string, listener: ((...args: any[]) => void) | undefined, options?: any) => void) {
  const listeners = new Set<() => void>()

  // Clean up all listeners when autolisten's owner cleans up
  onCleanup(() => {
    listeners.forEach(cleanup => cleanup())
    listeners.clear()
  })

  return ((type: any, callback: any, ...options: any[]) => {
    createRenderEffect(
      () => callback,
      () => {
        if (callback === undefined || callback === null) return

        resolve(object).addEventListener(type, callback, ...options)

        const cleanup = () => {
          resolve(object).removeEventListener(type, callback, ...options)
          listeners.delete(cleanup)
        }

        listeners.add(cleanup)
        onCleanup(cleanup)
      },
    )
  }) as any
}
