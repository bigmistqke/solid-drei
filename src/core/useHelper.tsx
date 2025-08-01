import { Accessor, createMemo, onCleanup } from 'solid-js'
import { useFrame, useThree } from 'solid-three'
import { Object3D } from 'three'
import { whenever } from '../utils/conditionals'
import { resolveAccessor } from '../utils/resolve-accessor'

type Helper = Object3D & { update: () => void; dispose: () => void }
type Constructor = new (...args: any[]) => any
type Rest<T> = T extends [infer _, ...infer R] ? R : never

export function useHelper<T extends Constructor>(
  object3D: Object3D | undefined | Accessor<Object3D | undefined>,
  helperConstructor: T,
  ...args: Rest<ConstructorParameters<T>>
) {
  const store = useThree()

  const helper = createMemo(
    whenever(
      () => resolveAccessor(object3D),
      object3D => {
        const helper = new (helperConstructor as any)(object3D, ...args)
        // Prevent the helpers from blocking rays
        helper.traverse(child => (child.raycast = () => null))
        store.scene.add(helper)
        onCleanup(() => {
          store.scene.remove(helper)
          helper.dispose?.()
        })

        return helper as Helper
      },
    ),
  )

  useFrame(() => void helper()?.update())

  return helper
}
