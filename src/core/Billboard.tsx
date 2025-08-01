import { Ref, createEffect } from 'solid-js'
import { S3, T, useFrame } from 'solid-three'
import { Group } from 'three'
import { processProps } from '../utils/process-props'

export interface BillboardProps extends S3.Props<'Group'> {
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
  let group: Group

  useFrame(({ camera }) => {
    if (!config.follow) return

    // save previous rotation in case we're locking an axis
    const prevRotation = group.rotation.clone()

    // always face the camera
    camera.getWorldQuaternion(group.quaternion)

    // readjust any axis that is locked
    if (config.lockX) group.rotation.x = prevRotation.x
    if (config.lockY) group.rotation.y = prevRotation.y
    if (config.lockZ) group.rotation.z = prevRotation.z
  })

  createEffect(() => {
    if (typeof config.ref === 'function') config.ref(group)
    else config.ref = group
  })

  return <T.Group ref={group!} {...rest} />
}
