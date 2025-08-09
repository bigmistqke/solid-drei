import type { JSX, Ref } from 'solid-js'
import { Show, splitProps } from 'solid-js'
import { Entity, type S3 } from 'solid-three'
import type { Group, Mesh, Object3D } from 'three'
import { useGLTF } from './useGLTF'

interface GltfProps extends S3.Props<typeof Group> {
  ref: Ref<Group>
  src: string
  /** Children will be placed within the object, or within the group that holds arrayed objects */
  children?: JSX.Element
  /** Can clone materials and/or geometries deeply (default: false) */
  deep?: boolean | 'materialsOnly' | 'geometriesOnly'
  /** The property keys it will shallow-clone (material, geometry, visible, ...) */
  keys?: string[]
  /** Can either spread over props or fill in JSX children, applies to every mesh within */
  inject?: S3.Props<Mesh> | JSX.Element | ((object: Object3D) => JSX.Element)
  /** Short access castShadow, applied to every mesh within */
  castShadow?: boolean
  /** Short access receiveShadow, applied to every mesh within */
  receiveShadow?: boolean
  isChild?: boolean
}

export const Gltf = (props: GltfProps) => {
  const [config, rest] = splitProps(props, ['src'])
  const resource = useGLTF(() => config.src)
  return <Show when={resource()?.scene}>{scene => <Entity from={scene()} {...rest} />}</Show>
}
