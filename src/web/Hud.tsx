import type { ParentProps } from 'solid-js'
import { createSignal, onSettled } from 'solid-js'
import { Portal, useFrame, useThree } from 'solid-three'
import * as THREE from 'three'

type HudProps = ParentProps<{
  /** Render priority, default: 1 */
  renderPriority?: number
}>

export function Hud(props: HudProps) {
  const store = useThree()
  const [scene] = createSignal(new THREE.Scene())

  useFrame(
    () => {
      store.gl.autoClear = false
      store.gl.clearDepth()
      store.gl.render(scene(), store.camera)
      store.gl.autoClear = true
    },
    { priority: props.renderPriority ?? 1 },
  )

  onSettled(() => () => scene().clear())

  return <Portal element={scene()}>{props.children}</Portal>
}
