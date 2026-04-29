import { createEffect, onCleanup } from 'solid-js'
import type { Accessor } from 'solid-js'

export function useCursor(hovered: Accessor<boolean>, onPointerOver = () => 'pointer', onPointerOut = () => 'auto') {
  createEffect(
    () => hovered(),
    () => {
      if (hovered()) {
        document.body.style.cursor = onPointerOver()
        onCleanup(() => {
          document.body.style.cursor = onPointerOut()
        })
      }
    },
  )
}
