import { check } from '@/utils/conditionals'
import { createSignal } from 'solid-js'
import { useFrame } from 'solid-three'
import * as THREE from 'three'

export function useTurntable() {
  // let turntable = { ref: null! as THREE.Mesh }
  const [turntable, setTurntable] = createSignal<THREE.Object3D>()
  useFrame(() => {
    check(turntable, turntable => {
      turntable.rotation.y += 0.01
    })
  })

  return setTurntable
}
