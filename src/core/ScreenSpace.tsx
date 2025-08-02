import { type Ref, createEffect } from 'solid-js'
import { type S3, T, useFrame } from 'solid-three'
import { Group } from 'three'
import { processProps } from '@/utils/process-props'

export interface ScreenSpaceProps extends S3.Props<'Group'> {
  ref?: Ref<Group>
  depth?: number
}

export function ScreenSpace(props: ScreenSpaceProps) {
  const [config, rest] = processProps(props, { depth: -1 }, ['ref', 'children', 'depth'])

  let group: Group

  useFrame(({ camera }) => {
    if (!group) return
    group.quaternion.copy(camera.quaternion)
    group.position.copy(camera.position)
  })

  createEffect(() => {
    if (typeof props.ref === 'function') props.ref(group)
    else props.ref = group
  })

  return (
    <T.Group ref={group!} {...rest}>
      <T.Group position-z={-config.depth}>{config.children}</T.Group>
    </T.Group>
  )
}
