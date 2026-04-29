import { resolve } from '@/utils'
import type { Accessor } from 'solid-js'
import { createMemo, onCleanup } from 'solid-js'
import { useFrame, useThree } from 'solid-three'
import { Object3D } from 'three'

type Helper = Object3D & { update: () => void; dispose: () => void }
type Constructor = new (...args: any[]) => any
type Rest<T> = T extends [infer _, ...infer R] ? R : never

export function useHelper<T extends Constructor>(
  object3D: Object3D | undefined | Accessor<Object3D | undefined>,
  helperConstructor: T,
  ...args: Rest<ConstructorParameters<T>>
) {
  const store = useThree()

  const helper = createMemo(() => {
    const obj = resolve(object3D)
    if (!obj) return undefined
    const h = new (helperConstructor as any)(obj, ...args) as Helper
    h.traverse((child: Object3D) => (child.raycast = () => null))
    store.scene.add(h)
    onCleanup(() => {
      store.scene.remove(h)
      h.dispose?.()
    })
    return h
  })

  useFrame(() => void helper()?.update())

  return helper
}
