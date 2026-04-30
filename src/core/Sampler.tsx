import { processProps } from '@/utils'
import { type Accessor, type ParentProps, createRenderEffect, createSignal } from 'solid-js'
import { Entity, type S3 } from 'solid-three'
import {
  Color,
  Group,
  InstancedBufferAttribute,
  InstancedMesh,
  Mesh,
  Object3D,
  Vector3,
} from 'three'
import { MeshSurfaceSampler } from 'three-stdlib'

type SamplePayload = {
  /** The position of the sample. */
  position: Vector3
  /** The normal of the mesh at the sampled position. */
  normal: Vector3
  /** The vertex color of the mesh at the sampled position. */
  color: Color
}

export type TransformFn = (payload: TransformPayload, i: number) => void

type TransformPayload = SamplePayload & {
  /**
   * The dummy object used to transform each instance.
   * This object's matrix will be updated after transforming & it will be used
   * to set the instance's matrix.
   */
  dummy: Object3D
  /**
   * The mesh that's initially passed to the sampler.
   * Use this if you need to apply transforms from your mesh to your instances
   * or if you need to grab attributes from the geometry.
   */
  sampledMesh: Mesh
}

export interface useSurfaceSamplerProps {
  transform?: TransformFn
  weight?: string
  count?: number
}

export function useSurfaceSampler(
  mesh: Accessor<Mesh | undefined>,
  count = 16,
  transform?: TransformFn,
  weight?: string,
  instanceMesh?: Accessor<InstancedMesh | undefined>,
) {
  const arr = Array.from({ length: count }, () => [
    1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
  ]).flat()

  const [buffer, setBuffer] = createSignal<InstancedBufferAttribute>(
    new InstancedBufferAttribute(Float32Array.from(arr), 16),
    { equals: false },
  )

  createRenderEffect(
    () => {
      const _mesh = mesh()
      if (!_mesh) {
        return [] as const
      }

      const sampler = new MeshSurfaceSampler(_mesh)
      if (weight) sampler.setWeightAttribute(weight)
      sampler.build()

      _mesh.updateMatrixWorld(true)

      return [sampler, _mesh, instanceMesh?.()] as const
    },
    ([sampler, mesh, instanceMesh]) => {
      if (!sampler || !mesh) {
        return
      }

      const position = new Vector3()
      const normal = new Vector3()
      const color = new Color()
      const dummy = new Object3D()

      for (let i = 0; i < count; i++) {
        sampler.sample(position, normal, color)

        if (typeof transform === 'function') {
          transform({ dummy, sampledMesh: mesh, position, normal, color }, i)
        } else {
          dummy.position.copy(position)
        }

        dummy.updateMatrix()

        if (instanceMesh) {
          instanceMesh.setMatrixAt(i, dummy.matrix)
        }

        dummy.matrix.toArray(buffer().array, i * 16)
      }

      if (instanceMesh) {
        instanceMesh.instanceMatrix.needsUpdate = true
      }

      buffer().needsUpdate = true
      setBuffer(buffer)
    },
  )

  return buffer
}

type SamplerProps = ParentProps<{
  /**
   * The mesh that will be used to sample.
   * Does not need to be in the scene graph.
   */
  mesh?: Mesh
  /**
   * The InstancedMesh that will be controlled by the component.
   * This InstancedMesh's count value will determine how many samples are taken.
   */
  instances?: InstancedMesh
  /**
   * The NAME of the weight attribute to use when sampling.
   * @see https://threejs.org/docs/#examples/en/math/MeshSurfaceSampler.setWeightAttribute
   */
  weight?: string
  /**
   * Transformation to be applied to each instance.
   * Receives a dummy object3D with all the sampled data.
   * It should mutate `transformPayload.dummy`.
   */
  transform?: TransformFn
  count?: number
}> &
  S3.Props<typeof Group>

export function Sampler(_props: SamplerProps) {
  const [props, rest] = processProps(_props, { count: 16 }, [
    'children',
    'weight',
    'transform',
    'instances',
    'mesh',
    'count',
  ])

  let group: Group = null!
  const [instance, setInstance] = createSignal<InstancedMesh>()
  const [meshToSample, setMeshToSample] = createSignal<Mesh>()

  createRenderEffect(
    () => [props.instances, props.mesh] as const,
    () => {
      setInstance(
        props.instances ??
          (group.children.find(c => c.hasOwnProperty('instanceMatrix')) as InstancedMesh),
      )
      setMeshToSample(props.mesh ?? (group.children.find(c => c.type === 'Mesh') as Mesh))
    },
  )

  useSurfaceSampler(meshToSample, props.count, props.transform, props.weight, instance)

  return (
    <Entity from={Group} ref={group!} {...(rest as any)}>
      {props.children}
    </Entity>
  )
}
