import { processProps } from '@/utils'
import { createEffect, onCleanup } from 'solid-js'
import { Entity, getMeta } from 'solid-three'
import * as THREE from 'three'

export type ShadowAlphaProps = {
  /** Opacity of the shadow, default: 1 */
  opacity?: number
  /** Whether the component is enabled, default: true */
  visible?: boolean
}

/**
 * Makes the parent mesh invisible to the camera while still casting shadows.
 * Use `opacity` to control shadow strength via alphaTest on the depth material.
 *
 * @example
 * <mesh castShadow>
 *   <planeGeometry />
 *   <ShadowAlpha opacity={0.5} />
 * </mesh>
 */
export function ShadowAlpha(_props: ShadowAlphaProps) {
  const [props] = processProps(_props, { opacity: 1, visible: true }, ['opacity', 'visible'])

  let ref: THREE.MeshBasicMaterial = null!

  createEffect(() => {
    const mesh = getMeta(ref)?.parent?.object as THREE.Mesh | undefined
    if (!mesh) return

    const previousVisible = mesh.visible
    const previousCastShadow = mesh.castShadow
    const previousCustomDepthMaterial = mesh.customDepthMaterial

    // Make the mesh invisible to the camera
    mesh.visible = !!props.visible
    // Ensure it casts shadows
    mesh.castShadow = true

    // Create a custom depth material for shadow casting that respects opacity/alphaTest
    const depthMaterial = new THREE.MeshDepthMaterial({
      depthPacking: THREE.RGBADepthPacking,
      alphaTest: 1 - props.opacity,
    })
    mesh.customDepthMaterial = depthMaterial

    onCleanup(() => {
      mesh.visible = previousVisible
      mesh.castShadow = previousCastShadow
      mesh.customDepthMaterial = previousCustomDepthMaterial
      depthMaterial.dispose()
    })
  })

  return (
    <Entity
      from={THREE.MeshBasicMaterial}
      ref={ref!}
      colorWrite={false}
      attach="material"
    />
  )
}
