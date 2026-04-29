import type { JSX } from 'solid-js'
import { Entity } from 'solid-three'
import * as THREE from 'three'
import { Instance, Instances } from './Instances'
import type { InstanceProps } from './Instances'

type MergedProps = {
  /** Array of meshes to create instanced versions of */
  meshes: THREE.Mesh[]
  /** Children receive one instanced-mesh component per input mesh */
  children: (
    ...components: ((props: Omit<InstanceProps, 'context'>) => JSX.Element)[]
  ) => JSX.Element
  /** Max instances per mesh, defaults to 1000 */
  limit?: number
  /** Frames to render, defaults to Infinity */
  frames?: number
}

export function Merged(props: MergedProps) {
  const limit = () => props.limit ?? 1000
  const frames = () => props.frames ?? Infinity

  // Build a unique context per slot so Instance components know which
  // InstancedMesh they belong to, regardless of render order.
  // We use the Instances function-children overload which exposes the
  // bound Instance factory for each slot.

  return (
    <Entity from={THREE.Group}>
      <MergedTree
        meshes={props.meshes}
        limit={limit()}
        frames={frames()}
        index={0}
        factories={[]}
        children={props.children}
      />
    </Entity>
  )
}

// Recursively nest Instances so that each level's context is available to
// Instance components rendered inside props.children.
// Once all factories are collected (index === meshes.length) we call children.
function MergedTree(treeProps: {
  meshes: THREE.Mesh[]
  limit: number
  frames: number
  index: number
  factories: Array<(p: Omit<InstanceProps, 'context'>) => JSX.Element>
  children: (
    ...components: ((props: Omit<InstanceProps, 'context'>) => JSX.Element)[]
  ) => JSX.Element
}): JSX.Element {
  const { meshes, limit, frames, index, factories, children } = treeProps

  if (index >= meshes.length) {
    return children(...factories) as JSX.Element
  }

  const mesh = meshes[index]

  return (
    <Instances
      geometry={mesh.geometry}
      material={mesh.material as THREE.Material}
      limit={limit}
      frames={frames}
    >
      {Inst => {
        // Register this slot's factory (idempotent — same index always same factory)
        const nextFactories = [...factories]
        nextFactories[index] = (p: Omit<InstanceProps, 'context'>) => <Inst {...p} />

        return (
          <MergedTree
            meshes={meshes}
            limit={limit}
            frames={frames}
            index={index + 1}
            factories={nextFactories}
            children={children}
          />
        ) as JSX.Element
      }}
    </Instances>
  )
}
