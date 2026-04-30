import { processProps, useRef } from '@/utils'
import { children, createRenderEffect } from 'solid-js'
import { Entity, type S3 } from 'solid-three'
import * as THREE from 'three'
import { DoubleSide, Mesh, MeshBasicMaterial, PlaneGeometry, RingGeometry, Vector3 } from 'three'

export type LightProps = Omit<S3.Props<typeof Mesh>, 'scale'> & {
  args?: any[]
  map?: THREE.Texture
  toneMapped?: boolean
  color?: S3.Color
  /** 'circle' | 'ring' | 'rect', default: 'rect' */
  form?: 'circle' | 'ring' | 'rect' | (string & {})
  scale?: number | [number, number, number] | [number, number]
  intensity?: number
  target?: [number, number, number] | THREE.Vector3
}

export function Lightformer(_props: LightProps) {
  const [props, rest] = processProps(
    _props,
    {
      toneMapped: false,
      color: 'white' as S3.Color,
      form: 'rect' as const,
      intensity: 1,
      scale: 1 as number | [number, number, number] | [number, number],
    },
    [
      'ref',
      'args',
      'map',
      'toneMapped',
      'color',
      'form',
      'intensity',
      'scale',
      'target',
      'children',
    ],
  )

  let mesh: Mesh = null!
  useRef(_props, () => mesh)

  const c = children(() => props.children)

  createRenderEffect(
    () => [props.color, props.intensity, props.target, c(), (rest as any).material] as const,
    () => {
      if (!mesh) return
      if (!c() && !(rest as any).material) {
        const mat = mesh.material as MeshBasicMaterial
        if (mat?.color) {
          mat.color.set(props.color as THREE.ColorRepresentation)
          mat.color.multiplyScalar(props.intensity)
        }
      }
      if (props.target) {
        mesh.lookAt(
          Array.isArray(props.target)
            ? new Vector3(...(props.target as [number, number, number]))
            : (props.target as Vector3),
        )
      }
    },
  )

  const scale = () => {
    const _scale = props.scale
    return Array.isArray(_scale) && _scale.length === 2
      ? ([_scale[0], _scale[1], 1] as [number, number, number])
      : (_scale as number | [number, number, number])
  }

  return (
    <Entity from={Mesh} ref={mesh!} scale={scale()} {...(rest as any)}>
      {props.form === 'circle' ? (
        <Entity from={RingGeometry} args={[0, 1, 64]} />
      ) : props.form === 'ring' ? (
        <Entity from={RingGeometry} args={[0.5, 1, 64]} />
      ) : (
        <Entity from={PlaneGeometry} />
      )}
      {c() ?? !(rest as any).material ? (
        <Entity
          from={MeshBasicMaterial}
          toneMapped={props.toneMapped}
          map={props.map}
          side={DoubleSide}
        />
      ) : null}
    </Entity>
  )
}
