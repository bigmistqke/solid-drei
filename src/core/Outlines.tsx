import { processProps, useRef } from '@/utils'
import type { Ref } from 'solid-js'
import { createEffect, onCleanup, onMount } from 'solid-js'
import { Entity, getMeta, type S3 } from 'solid-three'
import * as THREE from 'three'
import { BackSide, Color, FrontSide, Mesh, MeshBasicMaterial, ShaderMaterial } from 'three'

/**********************************************************************************/
/*                                                                                */
/*                                    Outlines                                    */
/*                                                                                */
/**********************************************************************************/

export type OutlinesProps = {
  ref?: Ref<Mesh>
  /** Outline color, default: 'black' */
  color?: S3.Color
  /** Outline thickness in world units, default: 0.05 */
  thickness?: number
  /** Scale factor for the outline mesh, alternative to thickness, default: undefined */
  scale?: number
  /** Whether to use screenspace sizing, default: false */
  screenspace?: boolean
  /** Opacity of the outline, default: 1 */
  opacity?: number
  /** Whether the material is transparent, default: false */
  transparent?: boolean
  /** Whether the outline is tone-mapped, default: true */
  toneMapped?: boolean
  /** Angle threshold in degrees for smoothing normals, default: undefined (use geometry normals) */
  angle?: number
}

/** Outlines rendered via the inverted-hull (back-face) technique.
 *  Place as a child of a Mesh to render an outline around it.
 */
export function Outlines(_props: OutlinesProps) {
  const [props, rest] = processProps(
    _props,
    {
      color: 'black',
      thickness: 0.05,
      screenspace: false,
      opacity: 1,
      transparent: false,
      toneMapped: true,
    },
    ['ref', 'color', 'thickness', 'scale', 'screenspace', 'opacity', 'transparent', 'toneMapped', 'angle'],
  )

  let outlineMesh: Mesh = null!
  useRef(_props, () => outlineMesh)

  // Build the outline shader material
  const buildMaterial = () => {
    if (props.screenspace) {
      return new ShaderMaterial({
        side: BackSide,
        transparent: props.transparent,
        depthWrite: false,
        uniforms: {
          uColor: { value: new Color(props.color as THREE.ColorRepresentation) },
          uThickness: { value: props.scale ?? props.thickness },
          uOpacity: { value: props.opacity },
          uResolution: { value: new THREE.Vector2(1, 1) },
        },
        vertexShader: /* glsl */ `
          uniform float uThickness;
          uniform vec2 uResolution;
          void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vec4 projPos = projectionMatrix * mvPosition;
            vec3 n = normalize(normalMatrix * normal);
            vec2 offset = normalize(vec2(n.x, n.y));
            offset /= uResolution;
            offset *= uThickness * projPos.w * 2.0;
            projPos.xy += offset;
            gl_Position = projPos;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor;
          uniform float uOpacity;
          void main() {
            gl_FragColor = vec4(uColor, uOpacity);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }
        `,
      })
    } else {
      // World-space inverted hull
      return new ShaderMaterial({
        side: BackSide,
        transparent: props.transparent,
        depthWrite: false,
        uniforms: {
          uColor: { value: new Color(props.color as THREE.ColorRepresentation) },
          uThickness: { value: props.scale ?? props.thickness },
          uOpacity: { value: props.opacity },
        },
        vertexShader: /* glsl */ `
          uniform float uThickness;
          void main() {
            vec3 n = normalize(normalMatrix * normal);
            vec3 pos = position + n * uThickness;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor;
          uniform float uOpacity;
          void main() {
            gl_FragColor = vec4(uColor, uOpacity);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }
        `,
      })
    }
  }

  onMount(() => {
    // Share parent mesh geometry
    const parentMesh = getMeta(outlineMesh)?.parent?.object as THREE.Mesh | undefined
    if (parentMesh?.geometry) {
      outlineMesh.geometry = parentMesh.geometry
    }
  })

  createEffect(
    () => [props.color, props.scale ?? props.thickness, props.opacity, props.transparent] as const,
    () => {
      const mat = outlineMesh?.material as ShaderMaterial | undefined
      if (!mat?.uniforms) return
      mat.uniforms.uColor!.value = new Color(props.color as THREE.ColorRepresentation)
      mat.uniforms.uThickness!.value = props.scale ?? props.thickness
      mat.uniforms.uOpacity!.value = props.opacity
      mat.transparent = props.transparent
      mat.needsUpdate = true
    },
  )

  return (
    <Entity
      from={Mesh}
      ref={outlineMesh!}
      raycast={() => null}
      material={buildMaterial()}
      {...(rest as S3.Props<typeof Mesh>)}
    />
  )
}
