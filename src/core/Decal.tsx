import { processProps, useRef } from '@/utils'
import { type Accessor, type JSX, Show, createEffect, on, onCleanup } from 'solid-js'
import { Entity, type S3 } from 'solid-three'
import * as THREE from 'three'
import { AxesHelper, BoxGeometry, Euler, Mesh, MeshNormalMaterial, Object3D, Vector3 } from 'three'
import { DecalGeometry } from 'three-stdlib'

export type DecalProps = Omit<S3.Props<typeof Mesh>, 'children'> & {
  debug?: boolean
  mesh?: Accessor<Mesh>
  position?: S3.Vector3
  rotation?: S3.Euler | number
  scale?: S3.Vector3
  map?: THREE.Texture
  children?: JSX.Element
  polygonOffsetFactor?: number
  depthTest?: boolean
}

function isArray(vec: any): vec is number[] {
  return Array.isArray(vec)
}

function vecToArray(vec: number[] | S3.Vector3 | S3.Euler | number = [0, 0, 0]): [number, number, number] {
  if (isArray(vec)) return vec as [number, number, number]
  if (typeof vec === 'object' && 'x' in vec) return [vec.x as number, vec.y as number, vec.z as number]
  if (typeof vec === 'number') return [vec, vec, vec]
  return [0, 0, 0]
}

export function Decal(_props: DecalProps) {
  const [props, rest] = processProps(
    _props,
    { depthTest: false, polygonOffsetFactor: -1 },
    ['ref', 'debug', 'depthTest', 'polygonOffsetFactor', 'map', 'mesh', 'children', 'position', 'rotation', 'scale'],
  )

  let ref: Mesh = null!
  let helper: Mesh = null!
  useRef(_props, () => ref)

  createEffect(
    on(
      () => [
        props.mesh,
        ...vecToArray(props.position),
        ...vecToArray(props.scale),
        ...vecToArray(props.rotation as any),
      ],
      () => {
        const parent = props.mesh?.() || (ref?.parent instanceof Mesh ? ref.parent : null)
        if (!(parent instanceof Mesh)) {
          throw new Error('Decal must have a Mesh as parent or specify its "mesh" prop')
        }

        const state = {
          position: new Vector3(),
          rotation: new Euler(),
          scale: new Vector3(1, 1, 1),
        }

        if (parent && ref) {
          if (props.position) state.position.set(...vecToArray(props.position))
          if (props.scale) state.scale.set(...vecToArray(props.scale))

          const matrixWorld = parent.matrixWorld.clone()
          parent.matrixWorld.identity()

          if (!props.rotation || typeof props.rotation === 'number') {
            const o = new Object3D()
            o.position.copy(state.position)
            o.lookAt(parent.position)
            if (typeof props.rotation === 'number') o.rotateZ(props.rotation)
            state.rotation.copy(o.rotation)
          } else {
            state.rotation.set(...vecToArray(props.rotation))
          }

          ref.geometry = new DecalGeometry(parent, state.position, state.rotation, state.scale)
          if (helper) {
            helper.position.copy(state.position)
            helper.rotation.copy(state.rotation)
            helper.scale.copy(state.scale)
            helper.traverse(child => (child.raycast = () => null))
          }
          parent.matrixWorld = matrixWorld
          onCleanup(() => ref.geometry.dispose())
        }
      },
    ),
  )

  return (
    <Entity
      from={Mesh}
      ref={ref!}
      material-transparent
      material-polygonOffset
      material-polygonOffsetFactor={props.polygonOffsetFactor}
      material-depthTest={props.depthTest}
      material-map={props.map}
      {...(rest as any)}
    >
      {props.children}
      <Show when={props.debug}>
        <Entity from={Mesh} ref={helper!}>
          <Entity from={BoxGeometry} />
          <Entity from={MeshNormalMaterial} wireframe />
          <Entity from={AxesHelper} />
        </Entity>
      </Show>
    </Entity>
  )
}
