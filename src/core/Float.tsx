import { processProps, useRef } from '@/utils'
import type { JSX, Ref } from 'solid-js'
import type { S3 } from 'solid-three'
import { Entity, useFrame } from 'solid-three'
import { Group, MathUtils } from 'three'

export interface FloatProps extends Omit<S3.Props<Group>, 'children'> {
  ref?: Ref<Group>
  enabled?: boolean
  speed?: number
  rotationIntensity?: number
  floatIntensity?: number
  children: JSX.Element
  floatingRange?: [number?, number?]
}

export const Float = (props: FloatProps) => {
  const [config, rest] = processProps(
    props,
    {
      enabled: true,
      speed: 1,
      rotationIntensity: 1,
      floatIntensity: 1,
      floatingRange: [-0.1, 0.1],
    },
    ['ref', 'children', 'enabled', 'speed', 'rotationIntensity', 'floatIntensity', 'floatingRange'],
  )
  const group = new Group()

  let offset = Math.random() * 10000
  useFrame(state => {
    if (!config.enabled || config.speed === 0) return
    // TODO: implement state.clock
    const t = offset + state.clock.getElapsedTime()
    group.rotation.x = (Math.cos((t / 4) * config.speed) / 8) * config.rotationIntensity
    group.rotation.y = (Math.sin((t / 4) * config.speed) / 8) * config.rotationIntensity
    group.rotation.z = (Math.sin((t / 4) * config.speed) / 20) * config.rotationIntensity
    let yPosition = Math.sin((t / 4) * config.speed) / 10
    yPosition = MathUtils.mapLinear(
      yPosition,
      -0.1,
      0.1,
      config.floatingRange?.[0] ?? -0.1,
      config.floatingRange?.[1] ?? 0.1,
    )
    group.position.y = yPosition * config.floatIntensity
    group.updateMatrix()
  })

  useRef(props, group)

  return (
    <Entity from={new Group()} {...rest}>
      <Entity from={group} matrixAutoUpdate={false}>
        {config.children}
      </Entity>
    </Entity>
  )
}
