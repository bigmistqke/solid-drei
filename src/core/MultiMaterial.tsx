import type { JSX } from 'solid-js'
import { children, createEffect, onCleanup } from 'solid-js'
import { Entity, getMeta } from 'solid-three'
import * as THREE from 'three'

export type MultiMaterialProps = {
  children?: JSX.Element
}

export function MultiMaterial(props: MultiMaterialProps) {
  let ref: THREE.Object3D = null!
  const resolved = children(() => props.children)

  createEffect(
    () => resolved(),
    () => {
      const parent = getMeta(ref)?.parent?.object as THREE.Mesh | undefined
      if (!parent) return

      const host = ref
      const materials: THREE.Material[] = []
      host.traverse(child => {
        if ((child as THREE.Mesh).isMesh) {
          const m = (child as THREE.Mesh).material
          if (Array.isArray(m)) materials.push(...m)
          else if (m) materials.push(m)
        } else if ((child as unknown as THREE.Material).isMaterial) {
          materials.push(child as unknown as THREE.Material)
        }
      })

      if (materials.length === 0) return
      const previous = parent.material
      parent.material = materials as THREE.Material[]
      onCleanup(() => {
        parent.material = previous
      })
    },
  )

  return (
    <Entity from={THREE.Object3D} ref={ref!}>
      {resolved()}
    </Entity>
  )
}
