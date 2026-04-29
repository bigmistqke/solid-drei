import { createEffect, omit } from 'solid-js'
import type { S3 } from 'solid-three'
import { Entity, useFrame } from 'solid-three'
import { Box3, Group, Object3D, Vector3 } from 'three'

function anchorToVec3(anchor: S3.Representation<Vector3>): Vector3 {
  const v = new Vector3()
  if (typeof anchor === 'number') {
    v.setScalar(anchor)
  } else if (Array.isArray(anchor)) {
    v.fromArray(anchor)
  } else {
    v.copy(anchor as Vector3)
  }
  return v
}

const boundingBox = new Box3()
const boundingBoxSize = new Vector3()

export interface BBAnchorProps extends S3.Props<Group> {
  anchor: S3.Representation<Vector3>
}

export function BBAnchor(props: BBAnchorProps) {
  const rest = omit(props, 'anchor')

  const group = new Group()
  let parentRef: Object3D | null = null

  // Reattach group created by this component to the parent's parent,
  // so it becomes a sibling of its initial parent.
  // We do that so the children have no impact on a bounding box of a parent.
  createEffect(() => {
    if (group?.parent?.parent) {
      parentRef = group.parent
      group.parent.parent.add(group)
    }
  })

  useFrame(() => {
    if (parentRef) {
      boundingBox.setFromObject(parentRef)
      boundingBox.getSize(boundingBoxSize)

      const anchorVec = anchorToVec3(props.anchor)
      group.position.set(
        parentRef.position.x + (boundingBoxSize.x * anchorVec.x) / 2,
        parentRef.position.y + (boundingBoxSize.y * anchorVec.y) / 2,
        parentRef.position.z + (boundingBoxSize.z * anchorVec.z) / 2,
      )
    }
  })

  return <Entity from={group} {...rest} />
}
