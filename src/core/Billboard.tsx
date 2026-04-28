import { processProps, useRef } from '@/utils'
import type { Ref } from 'solid-js'
import type { S3 } from 'solid-three'
import { Entity, useFrame } from 'solid-three'
import { Group } from 'three'

export interface BillboardProps extends S3.Props<Group> {
  ref?: Ref<Group>
  follow?: boolean
  lockX?: boolean
  lockY?: boolean
  lockZ?: boolean
}

/**
 * Wraps children in a billboarded group. Sample usage:
 *
 * ```js
 * <Billboard>
 *   <Text>hi</Text>
 * </Billboard>
 * ```
 */
export function Billboard(props: BillboardProps) {
  const [config, rest] = processProps(
    props,
    { follow: true, lockX: false, lockY: false, lockZ: false },
    ['follow', 'lockX', 'lockY', 'lockZ', 'ref'],
  )
  const group = new Group()

  useFrame(({ camera }) => {
    if (!config.follow) return

    const prevRotation = group.rotation.clone()
    camera.getWorldQuaternion(group.quaternion)

    if (config.lockX) group.rotation.x = prevRotation.x
    if (config.lockY) group.rotation.y = prevRotation.y
    if (config.lockZ) group.rotation.z = prevRotation.z
  })

  useRef(props, group)

  return <Entity from={group} {...rest} />
}
