import type { Accessor } from 'solid-js'
import { createEffect } from 'solid-js'

export function useCursor(
  hovered: Accessor<boolean>,
  onPointerOver = () => 'pointer',
  onPointerOut = () => 'auto',
) {
  createEffect(
    () => hovered(),
    () => {
      if (hovered()) {
        document.body.style.cursor = onPointerOver()
        return () => {
          document.body.style.cursor = onPointerOut()
        }
      }
    },
  )
}
