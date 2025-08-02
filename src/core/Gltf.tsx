import { Show, splitProps } from 'solid-js'
import type { JSX, Ref } from 'solid-js'
import { T } from 'solid-three'
import type { S3 } from 'solid-three'
import * as THREE from 'three'
import { useGLTF } from './useGLTF'

interface GltfProps extends S3.Props<'Group'> {
  ref: Ref<THREE.Group>
  src: string
  /** Children will be placed within the object, or within the group that holds arrayed objects */
  children?: JSX.Element
  /** Can clone materials and/or geometries deeply (default: false) */
  deep?: boolean | 'materialsOnly' | 'geometriesOnly'
  /** The property keys it will shallow-clone (material, geometry, visible, ...) */
  keys?: string[]
  /** Can either spread over props or fill in JSX children, applies to every mesh within */
  inject?: S3.Props<'Mesh'> | JSX.Element | ((object: THREE.Object3D) => JSX.Element)
  /** Short access castShadow, applied to every mesh within */
  castShadow?: boolean
  /** Short access receiveShadow, applied to every mesh within */
  receiveShadow?: boolean
  isChild?: boolean
}

export const Gltf = (props: GltfProps) => {
  const [config, rest] = splitProps(props, ['ref', 'src'])
  const resource = useGLTF(() => props.src)
  return (
    <Show when={resource()?.scene}>
      {scene => <T.Primitive ref={config.ref} {...rest} object={scene()} />}
    </Show>
  )
}
