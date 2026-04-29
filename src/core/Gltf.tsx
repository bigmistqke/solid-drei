import type { Intersect } from '@/utils/types'
import type { JSX, Ref } from 'solid-js'
import { omit } from 'solid-js'
import { Entity, type S3 } from 'solid-three'
import type { Group, Mesh, Object3D } from 'three'
import { useGLTF, type UseGLTFOptions } from './useGLTF'

interface GltfProps extends Intersect<[S3.Props<Group>, UseGLTFOptions]> {
  ref?: Ref<Group>
  url: string
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
  const rest = omit(props, 'url', 'useDraco', 'useMeshOpt', 'extendLoader')
  const gltf = useGLTF(() => props.url, {
    useDraco: props.useDraco,
    useMeshOpt: props.useMeshOpt,
    extendLoader: props.extendLoader,
  })
  return <Entity from={gltf()?.scene} {...rest} />
}
