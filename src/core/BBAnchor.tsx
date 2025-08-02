import { onMount, splitProps } from 'solid-js'
import { T, useFrame } from 'solid-three'
import type { S3 } from 'solid-three'
import * as THREE from 'three'

const boundingBox = new THREE.Box3()
const boundingBoxSize = new THREE.Vector3()

export interface BBAnchorProps extends S3.Props<'Group'> {
  anchor: [number, number, number]
}

export function BBAnchor(props: BBAnchorProps) {
  const [config, rest] = splitProps(props, ['anchor'])

  let group: THREE.Group
  let parentRef: THREE.Object3D | null = null

  // Reattach group created by this component to the parent's parent,
  // so it becomes a sibling of its initial parent.
  // We do that so the children have no impact on a bounding box of a parent.
  onMount(() => {
    if (group?.parent?.parent) {
      parentRef = group.parent
      group.parent.parent.add(group)
    }
  })

  useFrame(() => {
    if (parentRef) {
      boundingBox.setFromObject(parentRef)
      boundingBox.getSize(boundingBoxSize)

      group.position.set(
        parentRef.position.x + (boundingBoxSize.x * config.anchor[0]) / 2,
        parentRef.position.y + (boundingBoxSize.y * config.anchor[1]) / 2,
        parentRef.position.z + (boundingBoxSize.z * config.anchor[2]) / 2,
      )
    }
  })

  return <T.Group ref={group!} {...rest} />
}
