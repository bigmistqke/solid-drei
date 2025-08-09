import { processProps } from '@/utils/process-props'
import { useRef } from '@/utils/use-refs'
import { type Ref } from 'solid-js'
import { Entity, type S3, useFrame } from 'solid-three'
import { Group } from 'three'

export interface ScreenSpaceProps extends S3.Props<Group> {
  ref?: Ref<Group>
  depth?: number
}

export function ScreenSpace(props: ScreenSpaceProps) {
  const [config, rest] = processProps(props, { depth: -1 }, ['ref', 'children', 'depth'])

  const group = new Group()

  useFrame(({ camera }) => {
    if (!group) return
    group.quaternion.copy(camera.quaternion)
    group.position.copy(camera.position)
  })

  useRef(props, group)

  return (
    <Entity from={group} {...rest}>
      <Entity from={new Group()} position-z={-config.depth}>
        {config.children}
      </Entity>
    </Entity>
  )
}
