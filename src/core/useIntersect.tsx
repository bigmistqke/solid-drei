import { createEffect, createSignal } from 'solid-js'
import { useFrame } from 'solid-three'
import { Object3D } from 'three'

export function useIntersect<T extends Object3D>(onChange: (visible: boolean) => void) {
  const [ref, setRef] = createSignal<T>()
  let check = false
  let temp = false

  createEffect(
    () => ref(),
    r => {
      if (!r) return
      const unsubFirst = useFrame(
        () => {
          check = false
        },
        { priority: -Infinity },
      )
      const oldOnRender = r.onBeforeRender
      r.onBeforeRender = () => (check = true)
      const unsubLast = useFrame(
        () => {
          if (check !== temp) onChange((temp = check))
        },
        { priority: Infinity, stage: 'after' },
      )
      return () => {
        r.onBeforeRender = oldOnRender
        unsubFirst()
        unsubLast()
      }
    },
  )

  return [ref, setRef] as const
}
