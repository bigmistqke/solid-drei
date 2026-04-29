import { processProps } from '@/utils'
import { check } from '@/utils/conditionals'
import { type Accessor, createEffect, onCleanup } from 'solid-js'
import { Entity, useThree, type S3 } from 'solid-three'
import { Group, Mesh, Raycaster } from 'three'
import { SAH, acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from 'three-mesh-bvh'

export interface BVHOptions {
  /** Split strategy, default: SAH */
  strategy?: typeof SAH
  verbose?: boolean
  setBoundingBox?: boolean
  maxDepth?: number
  maxLeafTris?: number
}

export type BvhProps = BVHOptions &
  S3.Props<typeof Group> & {
    enabled?: boolean
    firstHitOnly?: boolean
  }

const isMesh = (child: any): child is Mesh => child.isMesh

/** @deprecated Use the Bvh component instead */
export function useBVH(mesh: Accessor<Mesh | undefined>, options?: BVHOptions) {
  const opts = {
    strategy: SAH,
    verbose: false,
    setBoundingBox: true,
    maxDepth: 40,
    maxLeafTris: 10,
    ...options,
  }
  createEffect(
    () => mesh(),
    (m) => {
      check(m, mesh => {
        mesh.raycast = acceleratedRaycast
        const geometry = mesh.geometry as any
        geometry.computeBoundsTree = computeBoundsTree
        geometry.disposeBoundsTree = disposeBoundsTree
        geometry.computeBoundsTree(opts)
        onCleanup(() => {
          if (geometry.boundsTree) geometry.disposeBoundsTree()
        })
      })
    },
  )
}

export function Bvh(_props: BvhProps) {
  const [props, rest] = processProps(
    _props,
    {
      enabled: true,
      firstHitOnly: false,
      strategy: SAH,
      verbose: false,
      setBoundingBox: true,
      maxDepth: 40,
      maxLeafTris: 10,
    },
    ['ref', 'enabled', 'firstHitOnly', 'children', 'strategy', 'verbose', 'setBoundingBox', 'maxDepth', 'maxLeafTris'],
  )

  const store = useThree()
  let group: Group = null!

  (() => {
    if (props.enabled) {
      const options = {
        strategy: props.strategy,
        verbose: props.verbose,
        setBoundingBox: props.setBoundingBox,
        maxDepth: props.maxDepth,
        maxLeafTris: props.maxLeafTris,
      }
      ;(store.raycaster as Raycaster & { firstHitOnly?: boolean }).firstHitOnly = props.firstHitOnly
      group.traverse(child => {
        if (isMesh(child) && !(child.geometry as any).boundsTree && child.raycast === Mesh.prototype.raycast) {
          child.raycast = acceleratedRaycast
          const geo = child.geometry as any
          geo.computeBoundsTree = computeBoundsTree
          geo.disposeBoundsTree = disposeBoundsTree
          geo.computeBoundsTree(options)
        }
      })
      onCleanup(() => {
        delete (store.raycaster as any).firstHitOnly
        group.traverse(child => {
          if (isMesh(child) && (child.geometry as any).boundsTree) {
            ;(child.geometry as any).disposeBoundsTree()
            child.raycast = Mesh.prototype.raycast
          }
        })
      })
    }
  })

  return (
    <Entity from={Group} ref={group!} {...(rest as any)}>
      {props.children}
    </Entity>
  )
}
