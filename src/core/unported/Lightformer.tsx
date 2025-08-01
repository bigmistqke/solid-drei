import { createRenderEffect } from 'solid-js'
import { applyProps, Primitive, SolidThreeCore, T, ThreeProps } from 'solid-three'
import * as THREE from 'three'
import { capitalize } from '../utils/capitalize'
import { createRef } from '../utils/create-ref'
import { mergeRefs } from '../utils/merge-refs'
import { processProps } from '../utils/process-props'
import { RefComponent } from '../utils/type-utils'

export type LightProps = ThreeProps<THREE.Mesh> & {
  args?: any[]
  map?: THREE.Texture
  toneMapped?: boolean
  color?: SolidThreeCore.Color
  form?: 'circle' | 'ring' | 'rect' | (string & {})
  scale?: number | [number, number, number] | [number, number]
  intensity?: number
  target?: [number, number, number] | THREE.Vector3
}

export const Lightformer: RefComponent<any, LightProps, true> = _props => {
  const [props, rest] = processProps(
    _props,
    {
      toneMapped: false,
      color: 'white',
      form: 'rect',
      intensity: 1,
      scale: 1,
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
  // Apply emissive power
  const meshRef = createRef<THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>>(null!)
  createRenderEffect(() => {
    if (!props.children && !rest.material) {
      applyProps(meshRef.ref.material as any, { color: props.color })
      meshRef.ref.material.color.multiplyScalar(props.intensity)
    }
  }, [props.color, props.intensity, props.children, rest.material])

  // Target light
  createRenderEffect(() => {
    if (props.target)
      meshRef.ref.lookAt(
        Array.isArray(props.target) ? new THREE.Vector3(...props.target) : props.target,
      )
  }, [props.target])

  // Fix 2-dimensional scale
  props.scale =
    Array.isArray(props.scale) && props.scale.length === 2
      ? [props.scale[0], props.scale[1], 1]
      : props.scale

  return (
    <T.Mesh ref={mergeRefs(meshRef, props)} scale={props.scale} {...rest}>
      {props.form === 'circle' ? (
        <T.RingGeometry args={[0, 1, 64]} />
      ) : props.form === 'ring' ? (
        <T.RingGeometry args={[0.5, 1, 64]} />
      ) : props.form === 'rect' ? (
        <T.PlaneGeometry />
      ) : (
        <Primitive object={T[capitalize(props.form)]} args={props.args} />
      )}
      {props.children ? (
        props.children
      ) : !rest.material ? (
        <T.MeshBasicMaterial
          toneMapped={props.toneMapped}
          map={props.map}
          side={THREE.DoubleSide}
        />
      ) : null}
    </T.Mesh>
  )
}
