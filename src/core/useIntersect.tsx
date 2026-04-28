import { when } from '@/utils/conditionals'
import { createEffect, createSignal, onCleanup } from 'solid-js'
import { useFrame } from 'solid-three'
import { Object3D } from 'three'

export function useIntersect<T extends Object3D>(onChange: (visible: boolean) => void) {
  const [ref, setRef] = createSignal<T>()
  let check = false
  let temp = false

  createEffect(
    when(ref, ref => {
      useFrame(() => { check = false }, { priority: -Infinity })
      const oldOnRender = ref.onBeforeRender
      ref.onBeforeRender = () => (check = true)
      useFrame(() => {
        if (check !== temp) onChange((temp = check))
      }, { priority: Infinity, stage: 'after' })
      onCleanup(() => {
        ref.onBeforeRender = oldOnRender
      })
    }),
  )

  return [ref, setRef] as const
}
