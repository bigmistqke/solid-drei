/**********************************************************************************/
/*                                                                                */
/*                                  Auto Listen                                   */
/*                                                                                */
/**********************************************************************************/

import { resolve } from '@/utils'
import type { AccessorMaybe } from '@/utils/types'
import { createRenderEffect } from 'solid-js'

export function useAutolisten<
  TTarget extends {
    addEventListener(...args: any[]): void
    removeEventListener(...args: any[]): void
  },
>(
  object: AccessorMaybe<TTarget>,
): TTarget['addEventListener'] &
  ((type: string, listener: ((...args: any[]) => void) | undefined, options?: any) => void) {
  return ((type: any, callback: any, ...options: any[]) => {
    createRenderEffect(
      () => callback,
      () => {
        if (callback === undefined || callback === null) return

        resolve(object).addEventListener(type, callback, ...options)

        return () => resolve(object).removeEventListener(type, callback, ...options)
      },
    )
  }) as any
}
